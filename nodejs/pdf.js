const TelegramBot = require('node-telegram-bot-api');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const ExcelJS = require('exceljs');

const { createMachine, getMachineById,getMachineByChatId ,deleteMachineById,getAllMachines,updateMachineAttribute,updateMachineStatus} = require('./models/machine');

// Replace with your Telegram bot token
const token = '7504555887:AAFXL17VHeW7XhLwNseUMwfpUmZHcANFLm8';
 
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Function to get all technician data (mock implementation for demonstration)
async function getAllTechnicianData(chatId) {
    try {
        const admin = await getAllMachines(chatId);
        if (admin) {
            console.log(admin);
            return admin;
        }
        return false;
    } catch (error) {
        console.error('Error fetching technician:', error);
        await bot.sendMessage(chatId, 'There was an error checking your registration status.');
        return false;
    }
}

// Command to generate and send a PDF
bot.onText(/\/getpdf/, async (msg) => {
    const chatId = msg.chat.id;
    const all = await getAllTechnicianData(chatId);

    if (!all) {
        await bot.sendMessage(chatId, 'No data found.');
        return;
    }

    // Create a PDF document
    const doc = new PDFDocument();
    const pdfPath = `./output-${chatId}.pdf`;

    // Pipe the document to a file
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Add a title to the PDF
    doc.fontSize(25).text('Technician Data', { align: 'center' });
    doc.moveDown();

    // Define the table headers with improved alignment
    const startX = 50; // Starting x-coordinate for the table
    const columnGap = 100; // Gap between columns

    doc.fontSize(14)
        .text('Machine Name', startX, doc.y)
        .text('Short Code', startX + columnGap, doc.y)
        .text('Status', startX + 2 * columnGap, doc.y)
 
    doc.moveDown();

    // Draw a horizontal line under the headers
    doc.moveTo(startX, doc.y).lineTo(startX + 5 * columnGap + 200, doc.y).stroke();
    doc.moveDown();

    // Add the fetched data below the headers with the same alignment
    all.forEach(item => {
        doc.fontSize(12)
            .text(item.machineName, startX, doc.y)
            .text(item.machineShortCode, startX + columnGap, doc.y)
            .text(item.status ? "Active" : "InActive", startX + 2 * columnGap, doc.y)
          doc.moveDown();
    });

    // Finalize the PDF and end the stream
    doc.end();

    // Wait for the file to be fully written to disk
    writeStream.on('finish', () => {
        // Send the PDF file to the user
        bot.sendDocument(chatId, pdfPath)
            .then(() => {
                // Delete the file after sending
                fs.unlinkSync(pdfPath);
                console.log('PDF sent and file deleted successfully.');
            })
            .catch((err) => {
                console.error('Error sending the PDF:', err);
            });
    });

    // Handle errors during file writing
    writeStream.on('error', (err) => {
        console.error('Error writing PDF to file:', err);
        bot.sendMessage(chatId, 'Failed to generate the PDF.');
    });
});

// Start the bot
bot.on('message', (msg) => {
    console.log(`Received message from ${msg.from.username}: ${msg.text}`);
});
