const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { createTechnician, updateTechniciansLocation,getTechnicianById,getTechnicianByChatId ,getAllTechnicians,updateTechnicianAttribute,updateTechnicianStatus} = require('./models/technician');
const { createJob,getMyJob,getWorkDone,getJobs,updateJobConfirmStatus,getWeekReport,updateJobStatus,simpleConfirm,updateAvailability, getJobConfirmationById,getJobById,createJobConfirmation, getActiveTechnicianJobs } = require('./models/job');
const { createAdmin, getAdminById,getAdminByChatId ,getAllAdmins,updateAdminAttribute,updateAdminStatus} = require('./models/admin');
const { createMachine, getMachineById,getMachineByChatId ,deleteMachineById,getAllMachines,updateMachineAttribute,updateMachineStatus} = require('./models/machine');
const { createCompany, getCompanyById ,deleteCompanyById,getAllCompanies,updateCompanyAttribute,updateCompanyStatus} = require('./models/company');
const { createLocation, getLocationById,getLocationByChatId ,deleteLocationById,getAllLocations,updateLocationAttribute,updateLocationStatus} = require('./models/location');

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true , debug:true});
const adminId = 7245407632
const adminId2 = 339480019
const channelId = -1002342344184
 

async function getAllDatas(chatId) {
  try {
      // Fetch all data concurrently
      const [technicianData, locationData, companyData] = await Promise.all([
          getAllTechnicians(chatId),
          getAllLocations(chatId),
          getAllCompanies(chatId)
      ]);

      // Return the data as an object with separate properties
      return {
          technicianData: technicianData || [],
          locationData: locationData || [],
          companyData: companyData || []
      };
  } catch (error) {
      console.error('Error fetching data:', error);
      return {
          technicianData: [],
          locationData: [],
          companyData: []
      };
  }
}

// Example of how to use the data and store it
const AllUserInfo = {};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  try {
      const data = await getAllDatas(chatId);

      if (data) {
          // Store data separately for each state
          AllUserInfo[chatId] = {
              technicianData: data.technicianData,
              locationData: data.locationData,
              companyData: data.companyData
          };
      } else {
          console.warn('No data found');
      }
  } catch (error) {
      console.error('Error handling message:', error);
  }

  // console.log('AllUserInfo:', AllUserInfo[chatId].technicianData);  // Log the updated user info
});

 // Listen for the '/share_location' command
bot.onText(/Sjii/, (msg) => {
  const chatId = msg.chat.id;

  // Send a message with a button that requests the user's location
  bot.sendMessage(chatId, 'Please share your location:', {
    reply_markup: {
      keyboard: [
        [
          {
            text: 'Share Location',
            request_location: true, // This will prompt the user to share their location
          }
        ]
      ],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

// Listen for location messages
bot.on('location', async (msg) => {
  const chatId = msg.chat.id;
  const { latitude, longitude } = msg.location;

  // Update the location in the database
  const result = await updateTechniciansLocation(chatId, latitude, longitude);

  if (result.affectedRows > 0) {
    bot.sendMessage(chatId, 'Location updated successfully!',{
      reply_markup: mainTechMenuReplyMarkup

    });
  } else {
    bot.sendMessage(chatId, 'Failed to update your location.',{
      reply_markup: mainTechMenuReplyMarkup

    });
  }
});
 

 

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;

//   try {
//       const technicianData = await getAllTechnicianDatas(chatId);
//       const companyData = await getAllCompaniesDatas(chatId);
//       const locationData = await getAllLocationsDatas(chatId);

//       AllUserInfo[chatId] = {
//           technicianName: technicianData ? technicianData.firstName : 'Unknown',
//           lastName: technicianData ? technicianData.lastName : 'Unknown',
//           machineId: technicianData ? technicianData.machineId : 'Unknown',
//           companyName: companyData ? companyData.CompanyName : 'Unknown',
//           locationName: locationData ? locationData.LocationName : 'Unknown',
//       };
//   } catch (error) {
//       console.error('Error handling message:', error);
//   }
  
//   console.log(AllUserInfo[chatId])

// });

  const keyboardByTechnitian = [
    ['Add Job Assessment', 'View Technicians'], // First row
    ['Button 3', 'Button 4'], // Second row
    ['Button 5'] // Third row (can have a single button or more)
  ];
  
  // Create the reply markup for the keyboard
  const replyTechnitianMarkup = {
    keyboard: keyboardByTechnitian,
    resize_keyboard: true, // Optional: resize keyboard to fit the screen
    one_time_keyboard: true // Optional: hide the keyboard after use
  };

  function createCancelKeyboard() {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Cancel', callback_data: 'cancel_action' }]
        ]
      }
    };
  }
  bot.on('callback_query', (callbackQuery) => {
    const messageId = callbackQuery.message.message_id;
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
  
    if (data === 'cancel_action') {
      bot.sendMessage(chatId, 'Operation cancelled.');
        technicianRegistration[chatId] = null;
      // Optionally, delete the cancel button message
      bot.deleteMessage(chatId, messageId).catch((error) => console.log("Message already deleted."));
      
      // Perform any other cleanup operations here
    }
  });
// Store registration data
const userRegistration = {};

async function handleTechnicianRegistration(chatId) {
  try {
    const technician = await getTechnicianByChatId(chatId);
    if (technician) {
      // Check the type of skills and format accordingly
      let formattedSkills;
      if (Array.isArray(technician.skills)) {
        formattedSkills = technician.skills.map(skill => skill.name).join(', ');
      } else if (typeof technician.skills === 'string') {
        try {
          const skillsArray = JSON.parse(technician.skills);
          formattedSkills = skillsArray.map(skill => skill.name).join(', ');
        } catch (e) {
          console.error('Error parsing skills JSON:', e);
          formattedSkills = 'Error parsing skills';
        }
      } else {
        formattedSkills = 'No skills available';
      }

      const previewMessage = `
      👷‍♂️ *Technician Preview* 👷‍♂️
      First Name: ${technician.firstName}
      Last Name: ${technician.lastName}
      Phone: ${technician.phone}
      Email: ${technician.email}
      Skills: ${formattedSkills}
      Experience: ${technician.experience} years
      `;

      const options = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: 'Close', callback_data: 'closeProfile' } ],
          ],
        },
      };

      await bot.sendMessage(chatId, previewMessage, options);
      userRegistration[chatId] = null;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching technician:', error);
    await bot.sendMessage(chatId, 'There was an error checking your registration status.');
    return false;
  }
}

async function handleAdminRegistration(chatId) {
  try {
    const admin = await getAdminByChatId(chatId);
    if (admin) {
      await bot.sendMessage(chatId, `Welcome back. ${admin.firstName} ${admin.lastName}`);
      userRegistration[chatId] = null;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching technician:', error);
    await bot.sendMessage(chatId, 'There was an error checking your registration status.');
    return false;
  }
}
// Command to start the registration process
bot.onText(/\/register/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name || "Null";
  const username = msg.from.username;

  const isAlreadyRegistered = await handleTechnicianRegistration(chatId);

  if (!isAlreadyRegistered) {
    const keyboard = {
      reply_markup: {
        keyboard: [
          [
            {
              text: 'Share Contact',
              request_contact: true
            }
          ]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    };

    // Initialize registration data
    userRegistration[chatId] = {
      firstName,
      lastName,
      phone: null,
      email: "email",
      skills: [],
      experience: null,
      status: "0",
      chatId,
      username,
      latitude: null, // Add latitude
      longitude: null, // Add longitude
      previewMessageId: null
    };

    // Notify user to share contact
    await bot.sendMessage(chatId, 'Please share your phone number:', keyboard);
  }
});

// Handle received contact information
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const contact = msg.contact;

  if (contact) {
    const phoneNumber = contact.phone_number;

    // Update registration data with phone number
    if (userRegistration[chatId]) {
      userRegistration[chatId].phone = phoneNumber;

      // Ask the user to share their location
      const locationKeyboard = {
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Share Location',
                request_location: true
              }
            ]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      };

      await bot.sendMessage(chatId, 'Thank you for sharing your contact. Now please share your location:', locationKeyboard);
    }
  } else {
    await bot.sendMessage(chatId, 'It looks like you did not share a contact. Please try again.');
  }
});

// Handle received location information
bot.on('location', async (msg) => {
  const chatId = msg.chat.id;
  const location = msg.location;

  if (location) {
    const { latitude, longitude } = location;

    // Update registration data with latitude and longitude
    if (userRegistration[chatId]) {
      userRegistration[chatId].latitude = latitude;
      userRegistration[chatId].longitude = longitude;
      console.log(   userRegistration[chatId])
      // Remove the custom keyboard
      await bot.sendMessage(chatId, 'Thank you for sharing your location. We are processing your registration...', {
        reply_markup: {
          remove_keyboard: true
        }
      });

      // Check if username is set
      if (!userRegistration[chatId].username) {
        await bot.sendMessage(chatId, `Hello, ${userRegistration[chatId].firstName}! It looks like you don't have a Telegram username set. Please set one in your Telegram settings to continue.`);
      } else {
        // Simulate creating technician and handle response
        try {
          const technicianId = await createTechnician(userRegistration[chatId]);
          const messageId = userRegistration[chatId].previewMessageId;
         
          if (messageId) {
            await bot.deleteMessage(chatId, messageId);
          }

          // Confirm registration
          await bot.sendMessage(chatId, `Thank you for registering! Name: ${userRegistration[chatId].firstName}, Username: @${userRegistration[chatId].username}`,{
            reply_markup: mainTechMenuReplyMarkup
          }).then(() => {
            delete userRegistration[chatId]; // Clear registration data
          });
        } catch (error) {
          console.error('Error creating technician:', error);
          await bot.sendMessage(chatId, 'There was an error processing your registration.');
        }
      }
    }
  } else {
    await bot.sendMessage(chatId, 'It looks like you did not share a location. Please try again.');
  }
});

// Define the main menu keyboard with "Open"
const mainMenuKeyboard = [
  ['Dashboard' ], // Single button row for "Open"
];
const mainTechMenuKeyboard = [
  [ 'Job Settings'], // Single button row for "Open"
];
// Define the sub-menu keyboard with "Back"
const openMenuKeyboard = [
  ['Add Machine', 'View Technicians'], // First row
  ['View Machines', 'View Admins'], // Second row
  ['Add Company', 'View Companies'], // Third row
  ['Add Location', 'View Locations'], // Fourth row
  ['Back'], // Single button row for "Back"
];

const jobSettings = [
  ['Get Jobs', 'Active Jobs'], // First row
  ['Work Done', 'Week Report'], // Second row
   ['Share Location'], // Single button row for "Back"
  ['Back to Job Settings'], // Single button row for "Back"
];
// Create the reply markup for the keyboards
const mainMenuReplyMarkup = {
  keyboard: mainMenuKeyboard,
  resize_keyboard: true, // Optional: resize keyboard to fit the screen
  one_time_keyboard: true // Optional: hide the keyboard after use
};
const mainTechMenuReplyMarkup = {
  keyboard: mainTechMenuKeyboard,
  resize_keyboard: true, // Optional: resize keyboard to fit the screen
  one_time_keyboard: true // Optional: hide the keyboard after use
};
const openMenuReplyMarkup = {
  keyboard: openMenuKeyboard,
  resize_keyboard: true, // Optional: resize keyboard to fit the screen
  one_time_keyboard: true // Optional: hide the keyboard after use
};
const openJobsMenuReplyMarkup = {
  keyboard: jobSettings,
  resize_keyboard: true, // Optional: resize keyboard to fit the screen
  one_time_keyboard: true // Optional: hide the keyboard after use
};
// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  userResponses[chatId] = null;
  userRegistration[chatId] = null
  try {
    // Check if the chat ID is the admin ID
    if (chatId === adminId || chatId === adminId2) {
      bot.sendMessage(chatId, "Welcome to the Technician Management System! Use the buttons below to navigate.", {
        reply_markup: mainMenuReplyMarkup
      });
    } else {
      const isAlreadyRegistered = await handleTechnicianRegistration(chatId);
      if (!isAlreadyRegistered) {
        bot.sendMessage(chatId, 'Welcome to the Technician Management System! Use /register to start the registration process.');
      } else {
        bot.sendMessage(chatId, 'You are already registered. Use the options below to manage your account.', {
          reply_markup: mainTechMenuReplyMarkup
        });
      }
    }
  } catch (error) {
    bot.sendMessage(chatId, 'An error occurred during the registration process. Please try again later.');
    console.error('Error handling technician registration:', error);
  }
});

// Handle "Open" and "Back" buttons
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'Dashboard') {
    bot.sendMessage(chatId, 'Choose an option:', {
      reply_markup: openMenuReplyMarkup
    });
  } else if (text === 'Back') {
    bot.sendMessage(chatId, 'Back to main menu:', {
      reply_markup: mainMenuReplyMarkup
    });
  }

  if (text === 'Job Settings') {
    bot.sendMessage(chatId, 'Choose an option:', {
      reply_markup: openJobsMenuReplyMarkup
    });
  }  else if (text === 'Back to Job Settings') {
    bot.sendMessage(chatId, 'Back to main menu:', {
      reply_markup: mainTechMenuReplyMarkup
    });
  }
});

// Add Technician Command
let technicianRegistration = {}; // Temporary storage for technician details

bot.onText(/Add Technician/, (msg) => {
    const chatId = msg.chat.id;

    technicianRegistration[chatId] = {
        step: 'first_name'
    };
    bot.sendMessage(chatId, "Please enter the technician's name:");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
  
    if (!technicianRegistration[chatId] || technicianRegistration[chatId].isEditing) return;
  
    const registration = technicianRegistration[chatId];
  
    switch (registration.step) {
        case 'first_name':
            registration.firstName = text;
            registration.step = 'last_name';
            bot.sendMessage(chatId, 'Please enter your lastname:', createCancelKeyboard());
            break;
          case 'last_name':
            registration.lastName = text;
            registration.step = 'phone';
            bot.sendMessage(chatId, 'Please enter the technician\'s phone number:', createCancelKeyboard());
            break;
        case 'phone':
            registration.phone = text;
            registration.step = 'email';
            bot.sendMessage(chatId, 'Please enter the technician\'s email address:', createCancelKeyboard());
            break;
        
        case 'email':
            registration.email = text;
            registration.step = 'skills';
            bot.sendMessage(chatId, 'Please enter the technician\'s skills (comma-separated):', createCancelKeyboard());
            break;
        
        case 'skills':
            registration.skills = text;
            registration.step = 'experience';
            bot.sendMessage(chatId, 'Please enter the technician\'s experience in years:', createCancelKeyboard());
            break;
        
        case 'experience':
            registration.experience = text;
            registration.status = 1;
            registration.chatId = chatId

            registration.step = 'preview';
            displayRegistrationDetails(chatId);
            break;
  
        default:
            
            break;
    }
});
  
async function displayRegistrationDetails(chatId) {
    const registration = technicianRegistration[chatId];
    // console.log(registration)
    const previewMessage = `
    👷‍♂️ *Technician Preview* 👷‍♂️
    First Name: ${registration.firstName}
    Last Name: ${registration.lastName}
    Phone: ${registration.phone}
    Email: ${registration.email}
    Skills: ${registration.skills}
    Experience: ${registration.experience} years
    `;
  
    const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Edit First Name', callback_data: 'edit_firstName' },{ text: 'Edit Last Name', callback_data: 'edit_lastName' }],
                [{ text: 'Edit Email', callback_data: 'edit_email' },{ text: 'Edit Skills', callback_data: 'edit_skills' }],
                [{ text: 'Edit Phone', callback_data: 'edit_phone' },{ text: 'Edit Experience', callback_data: 'edit_experience' }],
                [{ text: 'Confirm', callback_data: 'confirm' },{ text: 'Close', callback_data: 'close' } ],
            ],
        },
    };
  
    // Store the message ID for future editing
    if (!registration.previewMessageId) {
        const sentMessage = await bot.sendMessage(chatId, previewMessage, options);
        registration.previewMessageId = sentMessage.message_id;
    } else {
        await bot.editMessageText(previewMessage, {
            chat_id: chatId,
            message_id: registration.previewMessageId,
            parse_mode: 'Markdown',
            reply_markup: options.reply_markup
        });
    }
}
  
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    if (data.startsWith('edit_')) {
        const field = data.split('_')[1];
        const fieldMap = {
            firstName: "firstName",
            lastName:"lastName",
            phone: "Phone",
            email: "Email",
            skills: "Skills",
            experience: "Experience",
            status: "Status",

        };
      
        technicianRegistration[chatId].isEditing = true;
        bot.sendMessage(chatId, `Please enter a new ${fieldMap[field]}:`);

        bot.once('message', (msg) => {
            const text = msg.text;
            technicianRegistration[chatId][field] = text;
            technicianRegistration[chatId].isEditing = false;
            displayRegistrationDetails(chatId); // Re-display the preview after editing
        });

    } else if (data === 'confirm') {
        createTechnician(technicianRegistration[chatId]).then((technicianId) => {
            const messageId = technicianRegistration[chatId].previewMessageId;
          

            bot.sendMessage(chatId, `Technician added with ID: ${technicianId}`).then(()=>{
                bot.deleteMessage(chatId, messageId);
            });
            delete technicianRegistration[chatId]; // Clear registration data
        });
    }
    else if (data === 'close') {
    
       bot.deleteMessage(chatId, messageId).then(()=>{
           delete technicianRegistration[chatId];
       });
      
  }
});

// Assign Job Command
bot.onText(/\/assignjob/, (msg) => {
  bot.sendMessage(msg.chat.id, "Please send job details in the following format:\nCustomerID, ServiceType, Location, Description, TechnicianID");

  bot.once('message', async (response) => {
    const [customerId, serviceType, location, description, technicianId] = response.text.split(',');
    const jobId = await createJob({ customerId, serviceType, location, description, technicianId });
    bot.sendMessage(response.chat.id, `Job assigned with ID: ${jobId}`);
  });
});

async function getAllTechniciansData( chatId) {  
   try {
  const technicians = await getAllTechnicians();
  // console.log(technicians);
  if (technicians.length > 0) {
    const inlineKeyboard = technicians.map(technician => {
      const statusMessage = `Status: ${technician.status === "1" ? "🟢" : "🔴"}`;

      return [{ 
        text: statusMessage + " " + technician.firstName + " " + technician.lastName, 
        callback_data: `technician_${technician.id}` 
      }];
    });

    // Add the "Close" button at the end of the inline keyboard
    inlineKeyboard.push([{ text: 'Close', callback_data: 'close' }]);

    bot.sendMessage(chatId, 'Select a technician to view details:', {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  } else {
    bot.sendMessage(chatId, 'No technicians found.');
  }
} catch (error) {
  console.error('Error fetching technicians:', error);
  bot.sendMessage(chatId, 'An error occurred while fetching technicians.');
}}

 
bot.onText(/View Technicians/, async (msg) => {
  const chatId = msg.chat.id
  if(chatId === adminId || chatId === adminId2){
  await getAllTechniciansData(chatId)
  }
  
  });
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    if(data === 'back'){
      bot.deleteMessage(chatId, messageId).then(()=>{
          getAllTechniciansData(chatId)

      })
    }

    if (data.startsWith('technician_')) {
      const technicianId = data.split('_')[1];
  
      try {
        const technician = await getTechnicianById(technicianId);
        if (technician) {
          
          displayTechnicianDetailsWithEditOptions(chatId, technician);
          bot.deleteMessage(chatId,messageId)
        } else {
          bot.sendMessage(chatId, `Technician with ID ${technicianId} not found.`);
        }
      } catch (error) {
        console.error('Error fetching technician details:', error);
        bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
      }
    }
  
    // Handle edits
    else if (data.startsWith('update_')) {
      const [action, technicianId] = data.split('_').slice(1);
      const fieldMap = {
        firstName: "firstName",
        lastName:"lastName",
        phone: "Phone",
        email: "Email",
        skills: "Skills",
        experience: "Experience",
       

      };
      bot.deleteMessage(chatId, messageId).then(()=>{
        bot.sendMessage(chatId, `Please enter a new ${fieldMap[action]}:`, createCancelKeyboard());

      })

      
      bot.once('message', async (msg) => {
        const updatedValue = msg.text;
  
        // Here, you would update the technician's information in your database
        await updateTechnicianAttribute(technicianId, action, updatedValue);
        
        bot.sendMessage(chatId, `${fieldMap[action]} updated successfully!`);
  
        // Optionally, redisplay the technician details after the update
         try {
            const technician = await getTechnicianById(technicianId);
            if (technician) {
              displayTechnicianDetailsWithEditOptions(chatId, technician);
              // bot.deleteMessage(chatId,messageId)
            } else {
              bot.sendMessage(chatId, `Technician with ID ${technicianId} not found.`);
            }
          } catch (error) {
            console.error('Error fetching technician details:', error);
            bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
          }
      });
    }
   
 
  });

  bot.on('callback_query', async (query) => {
    const callbackData = query.data; // Get the callback data
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // Split the callback data
    const [action, technicianId, status] = callbackData.split('_');

    if (action === 'ChangeStatus') {
      bot.deleteMessage(chatId, messageId);
        // Function to create inline keyboard
        const createInlineKeyboard = (status) => {
            return {
                inline_keyboard: [
                    [
                        {
                            text: status === "1" ? '🟢 Make It Inactive' : '🔴 Make It Active',
                            callback_data: `buttonActive_${technicianId}_${status === "1" ? 0 : 1}`,
                        }
                    ]
                ]
            };
        };

        // Send a message asking to select status with inline keyboard
        await bot.sendMessage(chatId, `Please select status:`, {
            reply_markup: createInlineKeyboard(status),
        });

    } else if (action === 'buttonActive') {
        

        // Update the technician's status in the database
        await updateTechnicianStatus(technicianId, status);
// Optionally, redisplay the technician details after the update
try {
    const technician = await getTechnicianById(technicianId);
    if (technician) {
      displayTechnicianDetailsWithEditOptions(chatId, technician);
      
      bot.deleteMessage(chatId,messageId)
    } else {
      bot.sendMessage(chatId, `Technician with ID ${technicianId} not found.`);
    }
  } catch (error) {
    console.error('Error fetching technician details:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
  }
        // Notify the user
        await bot.sendMessage(chatId, `Status for technician has been changed to ${status}.`);
    }
});

 
  
  async function displayTechnicianDetailsWithEditOptions(chatId, technician) {
    const technicianId = technician.id;
     const status = technician.status
     const statusMessage = `Status: ${status === "1" ? '🟢 Active' : '🔴 InActive'}`

    const message = `Updated Technician Details:\nFull Name: ${technician.firstName} ${technician.lastName}\nPhone: ${technician.phone}\nEmail: ${technician.email}\nSkills: ${technician.skills}\nExperience: ${technician.experience} years\n${statusMessage} \nRole: ${technician.role === "3" ? "Technitian" : "Not Technitian"}`;
    
    const options = {
      reply_markup: {
        inline_keyboard: [
            [{ text: 'Edit First Name', callback_data: `update_firstName_${technicianId}` },{ text: 'Edit Last Name', callback_data: `update_lastName_${technicianId}` }],
             
            [{ text: 'Edit Email', callback_data: `update_email_${technicianId}` },{ text: 'Edit Skills', callback_data: `update_skills_${technicianId}` }],
     
            [{ text: 'Edit Experience', callback_data: `update_experience_${technicianId}` },{ text: 'Edit Phone', callback_data: `update_phone_${technicianId}` }],
            [{ text: 'Edit Status', callback_data: `ChangeStatus_${technicianId}_${status}` },{ text: 'Back', callback_data: 'back' }],

        ],
      },
    };
    
    return bot.sendMessage(chatId, message, options)
    .then(sentMessage => sentMessage.message_id);  // Return the messageId
      }
  
// // View Technician Command
// bot.onText(/\/viewtechnician /, async (msg, match) => {
//   const technicianId = match[1];
//   const technician = await getTechnicianById(technicianId);
//   if (technician) {
//     bot.sendMessage(msg.chat.id, `Technician Details:\nName: ${technician.name}\nPhone: ${technician.phone}\nEmail: ${technician.email}\nSkills: ${technician.skills}\nExperience: ${technician.experience} years`);
//   } else {
//     bot.sendMessage(msg.chat.id, `Technician with ID ${technicianId} not found.`);
//   }
// });
// // View All Technicians Command
// bot.onText(/\/viewtechnicians/, async (msg) => {
//     const technicians = await getAllTechnicians();
//     if (technicians.length > 0) {
//       let message = 'Technician Details:\n\n';
//       technicians.forEach((technician, index) => {
//         message += `👷‍♂️ Technician ${index + 1}:\nName: ${technician.name}\nPhone: ${technician.phone}\nEmail: ${technician.email}\nSkills: ${technician.skills}\nExperience: ${technician.experience} years\n\n`;
//       });
//       bot.sendMessage(msg.chat.id, message);
//     } else {
//       bot.sendMessage(msg.chat.id, 'No technicians found.');
//     }
//   });
  
// View Job Command
bot.onText(/\/viewjob (.+)/, async (msg, match) => {
  const jobId = match[1];
  const job = await getJobById(jobId);
  if (job) {
    bot.sendMessage(msg.chat.id, `Job Details:\nService Type: ${job.service_type}\nLocation: ${job.location}\nDescription: ${job.description}\nTechnician ID: ${job.technician_id}\nStatus: ${job.status}`);
  } else {
    bot.sendMessage(msg.chat.id, `Job with ID ${jobId} not found.`);
  }
});

// Additional commands for updating technician/job info, viewing job statuses, etc.



//add admin 
let adminRegistration = {}; // Temporary storage for technician details

bot.onText(/\/adminRegisteration/, async(msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    const isAlreadyRegistered = await handleAdminRegistration(chatId);

    if (!isAlreadyRegistered) {
    adminRegistration[chatId] = {
        step: 'admin_contact',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
        chatId: chatId,
        status: "0",
    };

    bot.sendMessage(chatId, "Please share the technician's phone number by clicking the button below:", {
        reply_markup: {
            keyboard: [
                [{
                    text: "Share Contact",
                    request_contact: true
                }]
            ],
            one_time_keyboard: true,
            resize_keyboard:true
        }
    });
  } 
});
function escapeMarkdown(text) {
  return text.replace(/([*_`[\]])/g, '\\$1');
}

bot.on('contact', (msg) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;
 
    if (adminRegistration[chatId] && adminRegistration[chatId].step === 'admin_contact') {
        adminRegistration[chatId].phone = contact.phone_number;
        adminRegistration[chatId].step = 'admin_email';

        bot.sendMessage(chatId, 'Please enter the technician\'s email address:', createCancelKeyboard());
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!adminRegistration[chatId] || adminRegistration[chatId].isAdminEditing || msg.contact) return;

    const registration = adminRegistration[chatId];

    switch (registration.step) {
        case 'admin_email':
            registration.email = text;
            registration.role = "User";
            registration.step = 'admin_preview';
            displayAdminRegistrationDetails(chatId);
            break;

        default:
             break;
    }
});
async function displayAdminRegistrationDetails(chatId) {
  const registration = adminRegistration[chatId];

  const previewMessage = `
  👷‍♂️ *Technician Preview* 👷‍♂️
  First Name: ${escapeMarkdown(registration.firstName)}
  Last Name: ${escapeMarkdown(registration.lastName)}
  Username: ${escapeMarkdown(registration.username)}
  Phone: ${escapeMarkdown(registration.phone)}
  Email: ${escapeMarkdown(registration.email)}
   
  `;

  const options = {
      parse_mode: 'Markdown',
      reply_markup: {
          inline_keyboard: [
              [{ text: 'Edit First Name', callback_data: 'AdminEdit_firstName' }, { text: 'Edit Last Name', callback_data: 'AdminEdit_lastName' }],
              [{ text: 'Edit Email', callback_data: 'AdminEdit_email' } ],
              [{ text: 'Edit Phone', callback_data: 'AdminEdit_phone' }],
              [{ text: 'Confirm', callback_data: 'adminConfirm' }, { text: 'Close', callback_data: 'close' }],
          ],
      },
  };

  if (!registration.previewMessageId) {
      const sentMessage = await bot.sendMessage(chatId, previewMessage, options);
      registration.previewMessageId = sentMessage.message_id;
  } else {
      await bot.editMessageText(previewMessage, {
          chat_id: chatId,
          message_id: registration.previewMessageId,
          parse_mode: 'Markdown',
          reply_markup: options.reply_markup
      });
  }
}

bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  if (data.startsWith('AdminEdit_')) {
      const field = data.split('_')[1];
      const fieldMap = {
          firstName: "First Name",
          lastName: "Last Name",
          phone: "Phone",
          email: "Email",
          role: "Role",
      };

      adminRegistration[chatId].isAdminEditing = true;
      bot.sendMessage(chatId, `Please enter a new ${fieldMap[field]}:`);

      bot.once('message', (msg) => {
          if (!adminRegistration[chatId] || !adminRegistration[chatId].isAdminEditing) return;

          const text = msg.text;
          adminRegistration[chatId][field] = text;
          adminRegistration[chatId].isAdminEditing = false;

          // Re-display the updated preview
          displayAdminRegistrationDetails(chatId);

          // Send success message replying to the message that displayed the updated preview
          bot.sendMessage(chatId, `${fieldMap[field]} updated successfully!`, {
              reply_to_message_id: adminRegistration[chatId].previewMessageId
          });
      });

  } else if (data === 'adminConfirm') {
      createAdmin(adminRegistration[chatId]).then((technicianId) => {
          bot.sendMessage(chatId, `Technician added with ID: ${technicianId}`, {
              reply_markup: {
                  remove_keyboard: true
              }
          }).then(() => {
              bot.deleteMessage(chatId, messageId);
          });
          delete adminRegistration[chatId]; // Clear registration data
      });
  } else if (data === 'close') {
      bot.deleteMessage(chatId, messageId).then(() => {
          delete adminRegistration[chatId];
      });
  }
});



// const options = {
//   reply_markup: {
//       inline_keyboard: [
//           [
//               { text: 'Admin', callback_data: '1' },
//               { text: 'Technician', callback_data: '3' },
//               { text: 'Finance', callback_data: '2' }
//           ]
//       ]
//   }
// };
// bot.sendMessage(chatId, 'Choose a role:', options);
 

// // Handle callback queries
// bot.on('callback_query', (callbackQuery) => {
// const chatId = callbackQuery.message.chat.id;
// const callbackData = callbackQuery.data;

// let responseText;
// switch (callbackData) {
//   case '1':
//       responseText = 'You selected Admin.';
//       break;
//   case '2':
//       responseText = 'You selected Finance.';
//       break;
//   case '3':
//       responseText = 'You selected Technician.';
//       break;
//   default:
//       responseText = 'Unknown selection.';
//       break;
// }

// // Answer the callback query
// bot.answerCallbackQuery(callbackQuery.id);

// // Send a message with the selection
// bot.sendMessage(chatId, responseText);
// });
//view admins

async function getAllAdminsData( chatId) {  
  try {
 const admins = await getAllAdmins();
 // console.log(admins);
 if (admins.length > 0) {
   const inlineKeyboard = admins.map(admin => {
     const statusMessage = `Status: ${admin.status === "1" ? "🟢" : "🔴"}`;

     return [{ 
       text: statusMessage + " " + admin.firstName + " " + admin.lastName, 
       callback_data: `viewAdmin_${admin.id}` 
     }];
   });

   // Add the "Close" button at the end of the inline keyboard
   inlineKeyboard.push([{ text: 'Close', callback_data: 'close' }]);

   bot.sendMessage(chatId, 'Select a admin to view details:', {
     reply_markup: {
       inline_keyboard: inlineKeyboard,
     },
   });
 } else {
   bot.sendMessage(chatId, 'No admins found.');
 }
} catch (error) {
 console.error('Error fetching admins:', error);
 bot.sendMessage(chatId, 'An error occurred while fetching admins.');
}}

bot.onText(/View Admins/, async (msg) => {
  const chatId = msg.chat.id
  if(chatId === adminId  || chatId === adminId2){

  await getAllAdminsData(chatId)
  }
  
  });
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    if(data === 'adminBack'){
      bot.deleteMessage(chatId, messageId).then(()=>{
        getAllAdminsData(chatId)

      })
    }

    if (data.startsWith('viewAdmin_')) {
      const adminId = data.split('_')[1];
  
      try {
        const technician = await getAdminById(adminId);
        if (technician) {
          
          displayAdminDetailsWithEditOptions(chatId, technician);
          bot.deleteMessage(chatId,messageId)
        } else {
          bot.sendMessage(chatId, `Technician with ID ${adminId} not found.`);
        }
      } catch (error) {
        console.error('Error fetching technician details:', error);
        bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
      }
    }
  
    // Handle edits
    else if (data.startsWith('adminUpdate_')) {
      const [action, adminId] = data.split('_').slice(1);
      const fieldMap = {
        firstName: "firstName",
        lastName:"lastName",
        phone: "Phone",
        email: "Email",
        role: "Role",
        

      };
      bot.deleteMessage(chatId, messageId).then(()=>{
        bot.sendMessage(chatId, `Please enter a new ${fieldMap[action]}:`, createCancelKeyboard());

      })

      
      bot.once('message', async (msg) => {
        const updatedValue = msg.text;
  
        // Here, you would update the technician's information in your database
        await updateAdminAttribute(adminId, action, updatedValue);
        
        bot.sendMessage(chatId, `${fieldMap[action]} updated successfully!`);
  
        // Optionally, redisplay the technician details after the update
         try {
            const technician = await getAdminById(adminId);
            if (technician) {
              displayAdminDetailsWithEditOptions(chatId, technician);
              bot.deleteMessage(chatId,messageId)
            } else {
              bot.sendMessage(chatId, `Technician with ID ${adminId} not found.`);
            }
          } catch (error) {
            console.error('Error fetching technician details:', error);
            bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
          }
      });
    }
   
 
  });

  bot.on('callback_query', async (query) => {
    const callbackData = query.data; // Get the callback data
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // Split the callback data
    const [action, adminId, status] = callbackData.split('_');

    if (action === 'ChangeAdminStatus') {
      bot.deleteMessage(chatId, messageId);
        // Function to create inline keyboard
        const createInlineKeyboard = (status) => {
            return {
                inline_keyboard: [
                    [
                        {
                            text: status === "1" ? '🟢 Make It Inactive' : '🔴 Make It Active',
                            callback_data: `buttonAdminActive_${adminId}_${status === "1" ? 0 : 1}`,
                        }
                    ]
                ]
            };
        };

        // Send a message asking to select status with inline keyboard
        await bot.sendMessage(chatId, `Please select status:`, {
            reply_markup: createInlineKeyboard(status),
        });

    } else if (action === 'buttonAdminActive') {
        

        // Update the technician's status in the database
        await updateAdminStatus(adminId, status);
// Optionally, redisplay the technician details after the update
try {
    const technician = await getAdminById(adminId);
    if (technician) {
      displayAdminDetailsWithEditOptions(chatId, technician);
      
      // bot.deleteMessage(chatId,messageId)
    } else {
      bot.sendMessage(chatId, `Technician with ID ${adminId} not found.`);
    }
  } catch (error) {
    console.error('Error fetching technician details:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
  }
        // Notify the user
        await bot.sendMessage(chatId, `Status for technician has been changed to ${status}.`);
    }
});


async function displayAdminDetailsWithEditOptions(chatId, technician) {
  const technicianId = technician.id;
   const status = technician.status
   const statusMessage = `  ${status === "1" ? '🟢 Active' : '🔴 InActive'}`

   const message = `Updated Admin Details:
   Full Name: ${technician.firstName} ${technician.lastName}
   Phone: ${technician.phone}
   Email: ${technician.email}
   Role: ${technician.role === "1" ? "ADMIN" : "Not Admin"}
   Status: ${statusMessage}`;
     
  const options = {
    reply_markup: {
      inline_keyboard: [
          [{ text: 'Edit First Name', callback_data: `adminUpdate_firstName_${technicianId}` },{ text: 'Edit Last Name', callback_data: `adminUpdate_lastName_${technicianId}` }],
           
          [{ text: 'Edit Email', callback_data: `adminUpdate_email_${technicianId}` },{ text: 'Edit Role', callback_data: `adminUpdate_role_${technicianId}` }],
   
          [ { text: 'Edit Phone', callback_data: `adminUpdate_phone_${technicianId}` }],
          [{ text: 'Edit Status', callback_data: `ChangeAdminStatus_${technicianId}_${status}` },{ text: 'Back', callback_data: 'adminBack' }],

      ],
    },
  };
  
  return bot.sendMessage(chatId, message, options)
  .then(sentMessage => sentMessage.message_id);  // Return the messageId
    }

    //machine add 

    let machineRegistration = {}; // Temporary storage for technician details

    bot.onText(/Add Machine/, (msg) => {
        const chatId = msg.chat.id;
    
        machineRegistration[chatId] = {
            step: 'machine_name'
        };
        bot.sendMessage(chatId, "Please enter the machine's name:");
    });
    
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
      
        if (!machineRegistration[chatId] || machineRegistration[chatId].isEditingMachine) return;
      
        const registration = machineRegistration[chatId];
      
        switch (registration.step) {
            case 'machine_name':
                registration.machineName = text;
                registration.step = 'machine_shortCode';
                bot.sendMessage(chatId, 'Please enter machine short code:', createCancelKeyboard());
                break;
            case 'machine_shortCode':
                registration.machineShortCode = text;           
                registration.status = 1;
                registration.chatId = chatId;
                registration.step = 'preview';
                displayMachineRegistrationDetails(chatId);
                break;
            default:
                 break;
        }
    });
      
    async function displayMachineRegistrationDetails(chatId) {
        const registration = machineRegistration[chatId];
        const previewMessage = `
        👷‍♂️ *Machine Preview* 👷‍♂️
        Machine Name: ${registration.machineName}
        Machine Code: ${registration.machineShortCode}
        `;
      
        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Edit Machine Name', callback_data: 'editMachine_machineName' },{ text: 'Edit Machine Code', callback_data: 'editMachine_machineShortCode' }],
                    [{ text: 'Confirm', callback_data: 'confirmMachine' },{ text: 'Close', callback_data: 'MachineClose' }],
                ],
            },
        };
      
        if (!registration.previewMessageId) {
            const sentMessage = await bot.sendMessage(chatId, previewMessage, options);
            registration.previewMessageId = sentMessage.message_id;
        } else {
            await bot.editMessageText(previewMessage, {
                chat_id: chatId,
                message_id: registration.previewMessageId,
                parse_mode: 'Markdown',
                reply_markup: options.reply_markup
            });
        }
    }
      
    bot.on('callback_query', (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        const messageId = callbackQuery.message.message_id;
      const action = data.split('_')[0];
        if (action === 'editMachine') {
            const field = data.split('_')[1];
            const fieldMap = {
                machineName: "machineName",
                machineShortCode: "machineShortCode",
            };
          
            machineRegistration[chatId].isEditingMachine = true;
    
            if (fieldMap[field]) {
                bot.sendMessage(chatId, `Please enter a new ${fieldMap[field]}:`);
    
                bot.once('message', (msg) => {
                    const text = msg.text;
                    machineRegistration[chatId][fieldMap[field]] = text;
                    machineRegistration[chatId].isEditingMachine = false;
                    
                    displayMachineRegistrationDetails(chatId); // Re-display the preview after editing
               

          // Send success message replying to the message that displayed the updated preview
          bot.sendMessage(chatId, `${fieldMap[field]} updated successfully!`, {
              reply_to_message_id: machineRegistration[chatId].previewMessageId
          });
                });
            } else {
                bot.sendMessage(chatId, 'Invalid field selected for editing.');
            }
    
        } else if (data === 'confirmMachine') {
            createMachine(machineRegistration[chatId]).then((machineId) => {
                const messageId = machineRegistration[chatId].previewMessageId;
    
                bot.sendMessage(chatId, `Machine added with ID: ${machineId}`).then(() => {
                    bot.deleteMessage(chatId, messageId);
                });
                delete machineRegistration[chatId]; // Clear registration data
            });
        } else if (data === 'MachineClose') {
            bot.deleteMessage(chatId, messageId).then(() => {
                delete machineRegistration[chatId];
            });
        }
    });
    
//view machines

 
async function getAllMachinesData( chatId) {  
  try {
 const machines = await getAllMachines();
 // console.log(machines);
 if (machines.length > 0) {
   const inlineKeyboard = machines.map(machine => {
     const statusMessage = `Status: ${machine.status === "1" ? "🟢" : "🔴"}`;

     return [{ 
       text: statusMessage + " " + machine.machineName + "    " + machine.machineShortCode, 
       callback_data: `viewMachine_${machine.id}` 
     }];
   });

   // Add the "Close" button at the end of the inline keyboard
   inlineKeyboard.push([{ text: 'Close', callback_data: 'close' }]);

   bot.sendMessage(chatId, 'Select a machine to view details:', {
     reply_markup: {
       inline_keyboard: inlineKeyboard,
     },
   });
 } else {
   bot.sendMessage(chatId, 'No machines found.');
 }
} catch (error) {
 console.error('Error fetching admins:', error);
 bot.sendMessage(chatId, 'An error occurred while fetching admins.');
}}

bot.onText(/View Machines/, async (msg) => {
  const chatId = msg.chat.id
  if(chatId === adminId  || chatId === adminId2){

  await getAllMachinesData(chatId)
  }
  
  });
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    if(data === 'machineBack'){
      bot.deleteMessage(chatId, messageId).then(()=>{
        getAllMachinesData(chatId)

      })
    }

    if (data.startsWith('viewMachine_')) {
      const machineId = data.split('_')[1];
  
      try {
        const machine = await getMachineById(machineId);
        if (machine) {
          
          displayMachineDetailsWithEditOptions(chatId, machine);
          bot.deleteMessage(chatId,messageId)
        } else {
          bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
        }
      } catch (error) {
        console.error('Error fetching machine details:', error);
        bot.sendMessage(chatId, 'An error occurred while fetching the machine details.');
      }
    }
  
    // Handle edits
    else if (data.startsWith('MachineUpdate_')) {
      const [action, adminId] = data.split('_').slice(1);
      const fieldMap = {
        machineName: "machineName",
        machineShortCode:"machineShortCode",
       
        

      };
      bot.deleteMessage(chatId, messageId).then(()=>{
        bot.sendMessage(chatId, `Please enter a new ${fieldMap[action]}:`, createCancelKeyboard());

      })

      
      bot.once('message', async (msg) => {
        const updatedValue = msg.text;
  
        // Here, you would update the technician's information in your database
        await updateMachineAttribute(adminId, action, updatedValue);
        
        bot.sendMessage(chatId, `${fieldMap[action]} updated successfully!`);
  
        // Optionally, redisplay the technician details after the update
         try {
            const technician = await getMachineById(adminId);
            if (technician) {
              displayMachineDetailsWithEditOptions(chatId, technician);
              // bot.deleteMessage(chatId,messageId)
            } else {
              bot.sendMessage(chatId, `Technician with ID ${adminId} not found.`);
            }
          } catch (error) {
            console.error('Error fetching technician details:', error);
            bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
          }
      });
    }
   
 
  });

  bot.on('callback_query', async (query) => {
    const callbackData = query.data; // Get the callback data
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // Split the callback data
    const [action, machineId, status] = callbackData.split('_');

    if (action === 'ChangeMachineStatus') {
      bot.deleteMessage(chatId, messageId);
        // Function to create inline keyboard
        const createInlineKeyboard = (status) => {
            return {
                inline_keyboard: [
                    [
                        {
                            text: status === "1" ? '🟢 Make It Inactive' : '🔴 Make It Active',
                            callback_data: `buttonMachineActive_${machineId}_${status === "1" ? 0 : 1}`,
                        }
                    ]
                ]
            };
        };

        // Send a message asking to select status with inline keyboard
        await bot.sendMessage(chatId, `Please select status:`, {
            reply_markup: createInlineKeyboard(status),
        });

    } 
    else if (action === 'buttonMachineActive') {
        

        // Update the technician's status in the database
        await updateMachineStatus(machineId, status);
// Optionally, redisplay the technician details after the update
try {
    const machine = await getMachineById(machineId);
    if (machine) {
      displayMachineDetailsWithEditOptions(chatId, machine);
      
      bot.deleteMessage(chatId,messageId)
    } else {
      bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
    }
  } catch (error) {
    console.error('Error fetching machine details:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching the machine details.');
  }
        // Notify the user
        await bot.sendMessage(chatId, `Status for machine has been changed to ${status}.`);
    }
    else if(action === 'deleteMachine'){
      const machine = await deleteMachineById(machineId);
    if (machine) {
      bot.deleteMessage(chatId, messageId).then(()=>{
  
      bot.sendMessage(chatId, `Machine with ID ${machineId} has been deleted.`);
      getAllMachinesData(chatId)
            
    })
    } else {
      bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
    }
    }
});


async function displayMachineDetailsWithEditOptions(chatId, machine) {
  const machineId = machine.id;
   const status = machine.status
   const statusMessage = `Status: ${status === "1" ? '🟢 Active' : '🔴 InActive'}`

  const message = `Updated Machine Details:\n Machine  Name: ${machine.machineName} \n Machine  Code:${machine.machineShortCode} \n${statusMessage}`;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
          [{ text: 'Edit Machine Name', callback_data: `MachineUpdate_machineName_${machineId}` },{ text: 'Edit Machine Code', callback_data: `MachineUpdate_machineShortCode_${machineId}` }],
 
          [{ text: 'Edit Status', callback_data: `ChangeMachineStatus_${machineId}_${status}` },{ text: 'Delete Mchine', callback_data: `deleteMachine_${machineId}` }],
          [{ text: 'Back', callback_data: 'machineBack' }],

      ],
    },
  };
  
  return bot.sendMessage(chatId, message, options)
  .then(sentMessage => sentMessage.message_id);  // Return the messageId
    }


    //company add 

    let companyRegistration = {}; // Temporary storage for technician details

    bot.onText(/Add Company/, (msg) => {
        const chatId = msg.chat.id;
    
        companyRegistration[chatId] = {
            step: 'company_name'
        };
        bot.sendMessage(chatId, "Please enter the company's name:");
    });
    
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
      
        if (!companyRegistration[chatId] || companyRegistration[chatId].isEditingCompany) return;
      
        const registration = companyRegistration[chatId];
      
        switch (registration.step) {
            case 'company_name':
                registration.CompanyName = text;
                registration.step = 'company_shortCode';
                bot.sendMessage(chatId, 'Please enter Company short code:', createCancelKeyboard());
                break;
            case 'company_shortCode':
                registration.CompanyShortCode = text;           
                registration.status = 1;
                registration.chatId = chatId;
                registration.step = 'preview';
                displaycompanyRegistrationDetails(chatId);
                break;
            default:
                bot.sendMessage(chatId, 'Registration step not recognized. Please start over.', createCancelKeyboard());
                break;
        }
    });
      
    async function displaycompanyRegistrationDetails(chatId) {
        const registration = companyRegistration[chatId];
        const previewMessage = `
        👷‍♂️ *Company Preview* 👷‍♂️
        Company Name: ${registration.CompanyName}
        Company Code: ${registration.CompanyShortCode}
        `;
      
        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Edit Company Name', callback_data: 'editCompany_CompanyName' },{ text: 'Edit Company Code', callback_data: 'editCompany_CompanyShortCode' }],
                    [{ text: 'Confirm', callback_data: 'confirmCompany' },{ text: 'Close', callback_data: 'CompanyClose' }],
                ],
            },
        };
      
        if (!registration.previewMessageId) {
            const sentMessage = await bot.sendMessage(chatId, previewMessage, options);
            registration.previewMessageId = sentMessage.message_id;
        } else {
            await bot.editMessageText(previewMessage, {
                chat_id: chatId,
                message_id: registration.previewMessageId,
                parse_mode: 'Markdown',
                reply_markup: options.reply_markup
            });
        }
    }
      
    bot.on('callback_query', (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        const messageId = callbackQuery.message.message_id;
      const action = data.split('_')[0];
        if (action === 'editCompany') {
            const field = data.split('_')[1];
            const fieldMap = {
                CompanyName: "CompanyName",
                CompanyShortCode: "CompanyShortCode",
            };
          
            companyRegistration[chatId].isEditingCompany = true;
    
            if (fieldMap[field]) {
                bot.sendMessage(chatId, `Please enter a new ${fieldMap[field]}:`);
    
                bot.once('message', (msg) => {
                    const text = msg.text;
                    companyRegistration[chatId][fieldMap[field]] = text;
                    companyRegistration[chatId].isEditingCompany = false;
                    
                    displaycompanyRegistrationDetails(chatId); // Re-display the preview after editing
               

          // Send success message replying to the message that displayed the updated preview
          bot.sendMessage(chatId, `${fieldMap[field]} updated successfully!`, {
              reply_to_message_id: companyRegistration[chatId].previewMessageId
          });
                });
            } else {
                bot.sendMessage(chatId, 'Invalid field selected for editing.');
            }
    
        } else if (data === 'confirmCompany') {
            createCompany(companyRegistration[chatId]).then((machineId) => {
                const messageId = companyRegistration[chatId].previewMessageId;
    
                bot.sendMessage(chatId, `Company added with ID: ${machineId}`).then(() => {
                    bot.deleteMessage(chatId, messageId);
                });
                delete companyRegistration[chatId]; // Clear registration data
            });
        } else if (data === 'CompanyClose') {
            bot.deleteMessage(chatId, messageId).then(() => {
                delete companyRegistration[chatId];
            });
        }
    });
    
//view machines

 
async function getAllCompaniesData( chatId) {  
  try {
 const machines = await getAllCompanies();
 // console.log(machines);
 if (machines.length > 0) {
   const inlineKeyboard = machines.map(machine => {
     const statusMessage = `Status: ${machine.status === "1" ? "🟢" : "🔴"}`;

     return [{ 
       text: statusMessage + " " + machine.CompanyName + "    " + machine.CompanyShortCode, 
       callback_data: `viewCompany_${machine.id}` 
     }];
   });

   // Add the "Close" button at the end of the inline keyboard
   inlineKeyboard.push([{ text: 'Close', callback_data: 'close' }]);

   bot.sendMessage(chatId, 'Select a machine to view details:', {
     reply_markup: {
       inline_keyboard: inlineKeyboard,
     },
   });
 } else {
   bot.sendMessage(chatId, 'No machines found.');
 }
} catch (error) {
 console.error('Error fetching admins:', error);
 bot.sendMessage(chatId, 'An error occurred while fetching admins.');
}}

bot.onText(/View Companies/, async (msg) => {
  const chatId = msg.chat.id
  if(chatId === adminId  || chatId === adminId2){

  await getAllCompaniesData(chatId)
  }
  
  });
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    if(data === 'CompanyBack'){
      bot.deleteMessage(chatId, messageId).then(()=>{
        getAllCompaniesData(chatId)

      })
    }

    if (data.startsWith('viewCompany_')) {
      const machineId = data.split('_')[1];
  
      try {
        const machine = await getCompanyById(machineId);
        if (machine) {
          
          displayCompanyDetailsWithEditOptions(chatId, machine);
          bot.deleteMessage(chatId,messageId)
        } else {
          bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
        }
      } catch (error) {
        console.error('Error fetching machine details:', error);
        bot.sendMessage(chatId, 'An error occurred while fetching the machine details.');
      }
    }
  
    // Handle edits
    else if (data.startsWith('CompanyUpdate_')) {
      const [action, adminId] = data.split('_').slice(1);
      const fieldMap = {
        CompanyName: "CompanyName",
        CompanyShortCode:"CompanyShortCode",
       
        

      };
      bot.deleteMessage(chatId, messageId).then(()=>{
        bot.sendMessage(chatId, `Please enter a new ${fieldMap[action]}:`, createCancelKeyboard());

      })

      
      bot.once('message', async (msg) => {
        const updatedValue = msg.text;
  
        // Here, you would update the technician's information in your database
        await updateCompanyAttribute(adminId, action, updatedValue);
        
        bot.sendMessage(chatId, `${fieldMap[action]} updated successfully!`);
  
        // Optionally, redisplay the technician details after the update
         try {
            const technician = await getCompanyById(adminId);
            if (technician) {
              displayCompanyDetailsWithEditOptions(chatId, technician);
              // bot.deleteMessage(chatId,messageId)
            } else {
              bot.sendMessage(chatId, `Technician with ID ${adminId} not found.`);
            }
          } catch (error) {
            console.error('Error fetching technician details:', error);
            bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
          }
      });
    }
   
 
  });

  bot.on('callback_query', async (query) => {
    const callbackData = query.data; // Get the callback data
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // Split the callback data
    const [action, machineId, status] = callbackData.split('_');

    if (action === 'ChangeCompanyStatus') {
      bot.deleteMessage(chatId, messageId);
        // Function to create inline keyboard
        const createInlineKeyboard = (status) => {
            return {
                inline_keyboard: [
                    [
                        {
                            text: status === "1" ? '🟢 Make It Inactive' : '🔴 Make It Active',
                            callback_data: `buttonCompanyActive_${machineId}_${status === "1" ? 0 : 1}`,
                        }
                    ]
                ]
            };
        };

        // Send a message asking to select status with inline keyboard
        await bot.sendMessage(chatId, `Please select status:`, {
            reply_markup: createInlineKeyboard(status),
        });

    } 
    else if (action === 'buttonCompanyActive') {
        

        // Update the technician's status in the database
        await updateCompanyStatus(machineId, status);
// Optionally, redisplay the technician details after the update
try {
    const machine = await getCompanyById(machineId);
    if (machine) {
      displayCompanyDetailsWithEditOptions(chatId, machine);
      
      bot.deleteMessage(chatId,messageId)
    } else {
      bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
    }
  } catch (error) {
    console.error('Error fetching machine details:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching the machine details.');
  }
        // Notify the user
        await bot.sendMessage(chatId, `Status for machine has been changed to ${status}.`);
    }
    else if(action === 'deleteCompany'){
      const machine = await deleteCompanyById(machineId);
    if (machine) {
      bot.deleteMessage(chatId, messageId).then(()=>{
  
      bot.sendMessage(chatId, `Machine with ID ${machineId} has been deleted.`);
      getAllCompaniesData(chatId)
            
    })
    } else {
      bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
    }
    }
});


async function displayCompanyDetailsWithEditOptions(chatId, machine) {
  const machineId = machine.id;
   const status = machine.status
   const statusMessage = `Status: ${status === "1" ? '🟢 Active' : '🔴 InActive'}`

  const message = `Updated Company Details:\n Company  Name: ${machine.CompanyName} \n Company  Code:${machine.CompanyShortCode} \n${statusMessage}`;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
          [{ text: 'Edit Company Name', callback_data: `CompanyUpdate_CompanyName_${machineId}` },{ text: 'Edit Company Code', callback_data: `CompanyUpdate_CompanyShortCode_${machineId}` }],
 
          [{ text: 'Edit Status', callback_data: `ChangeCompanyStatus_${machineId}_${status}` },{ text: 'Delete Company', callback_data: `deleteCompany_${machineId}` }],
          [{ text: 'Back', callback_data: 'CompanyBack' }],

      ],
    },
  };
  
  return bot.sendMessage(chatId, message, options)
  .then(sentMessage => sentMessage.message_id);  // Return the messageId
    }

    //locations add 

    let locationRegistration = {}; // Temporary storage for technician details

    bot.onText(/Add Location/, (msg) => {
        const chatId = msg.chat.id;
    
        locationRegistration[chatId] = {
            step: 'Location_name'
        };
        bot.sendMessage(chatId, "Please enter the Location's name:");
    });
    
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
      
        if (!locationRegistration[chatId] || locationRegistration[chatId].isEditingLocation) return;
      
        const registration = locationRegistration[chatId];
      
        switch (registration.step) {
            case 'Location_name':
                registration.LocationName = text;
                registration.step = 'Location_shortCode';
                bot.sendMessage(chatId, 'Please enter Location short code:', createCancelKeyboard());
                break;
            case 'Location_shortCode':
                registration.LocationShortCode = text;           
                registration.status = 1;
                registration.chatId = chatId;
                registration.step = 'preview';
                displaylocationRegistrationDetails(chatId);
                break;
            default:
                bot.sendMessage(chatId, 'Registration step not recognized. Please start over.', createCancelKeyboard());
                break;
        }
    });
      
    async function displaylocationRegistrationDetails(chatId) {
        const registration = locationRegistration[chatId];
        const previewMessage = `
        👷‍♂️ *Location Preview* 👷‍♂️
        Location Name: ${registration.LocationName}
        Location Code: ${registration.LocationShortCode}
        `;
      
        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Edit Location Name', callback_data: 'editLocation_LocationName' },{ text: 'Edit Location Code', callback_data: 'editLocation_LocationShortCode' }],
                    [{ text: 'Confirm', callback_data: 'confirmLocation' },{ text: 'Close', callback_data: 'LocationClose' }],
                ],
            },
        };
      
        if (!registration.previewMessageId) {
            const sentMessage = await bot.sendMessage(chatId, previewMessage, options);
            registration.previewMessageId = sentMessage.message_id;
        } else {
            await bot.editMessageText(previewMessage, {
                chat_id: chatId,
                message_id: registration.previewMessageId,
                parse_mode: 'Markdown',
                reply_markup: options.reply_markup
            });
        }
    }
      
    bot.on('callback_query', (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        const messageId = callbackQuery.message.message_id;
      const action = data.split('_')[0];
        if (action === 'editLocation') {
            const field = data.split('_')[1];
            const fieldMap = {
                LocationName: "LocationName",
                LocationShortCode: "LocationShortCode",
            };
          
            locationRegistration[chatId].isEditingLocation = true;
    
            if (fieldMap[field]) {
                bot.sendMessage(chatId, `Please enter a new ${fieldMap[field]}:`);
    
                bot.once('message', (msg) => {
                    const text = msg.text;
                    locationRegistration[chatId][fieldMap[field]] = text;
                    locationRegistration[chatId].isEditingLocation = false;
                    
                    displaylocationRegistrationDetails(chatId); // Re-display the preview after editing
               

          // Send success message replying to the message that displayed the updated preview
          bot.sendMessage(chatId, `${fieldMap[field]} updated successfully!`, {
              reply_to_message_id: locationRegistration[chatId].previewMessageId
          });
                });
            } else {
                bot.sendMessage(chatId, 'Invalid field selected for editing.');
            }
    
        } else if (data === 'confirmLocation') {
            createLocation(locationRegistration[chatId]).then((machineId) => {
                const messageId = locationRegistration[chatId].previewMessageId;
    
                bot.sendMessage(chatId, `Location added with ID: ${machineId}`).then(() => {
                    bot.deleteMessage(chatId, messageId);
                });
                delete locationRegistration[chatId]; // Clear registration data
            });
        } else if (data === 'LocationClose') {
            bot.deleteMessage(chatId, messageId).then(() => {
                delete locationRegistration[chatId];
            });
        }
    });
    
//view locations

 
async function getAllLocationsData( chatId) {  
  try {
 const machines = await getAllLocations();
 // console.log(machines);
 if (machines.length > 0) {
   const inlineKeyboard = machines.map(machine => {
     const statusMessage = `Status: ${machine.status === "1" ? "🟢" : "🔴"}`;

     return [{ 
       text: statusMessage + " " + machine.LocationName + "    " + machine.LocationShortCode, 
       callback_data: `viewLocation_${machine.id}` 
     }];
   });

   // Add the "Close" button at the end of the inline keyboard
   inlineKeyboard.push([{ text: 'Close', callback_data: 'close' }]);

   bot.sendMessage(chatId, 'Select a machine to view details:', {
     reply_markup: {
       inline_keyboard: inlineKeyboard,
     },
   });
 } else {
   bot.sendMessage(chatId, 'No machines found.');
 }
} catch (error) {
 console.error('Error fetching admins:', error);
 bot.sendMessage(chatId, 'An error occurred while fetching admins.');
}}

bot.onText(/View Locations/, async (msg) => {
  const chatId = msg.chat.id
  if(chatId === adminId  || chatId === adminId2){

  await getAllLocationsData(chatId)
  }
  
  });
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    if(data === 'LocationBack'){
      bot.deleteMessage(chatId, messageId).then(()=>{
        getAllLocationsData(chatId)

      })
    }

    if (data.startsWith('viewLocation_')) {
      const machineId = data.split('_')[1];
  
      try {
        const machine = await getLocationById(machineId);
        if (machine) {
          
          displayLocationDetailsWithEditOptions(chatId, machine);
          bot.deleteMessage(chatId,messageId)
        } else {
          bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
        }
      } catch (error) {
        console.error('Error fetching machine details:', error);
        bot.sendMessage(chatId, 'An error occurred while fetching the machine details.');
      }
    }
  
    // Handle edits
    else if (data.startsWith('LocationUpdate_')) {
      const [action, adminId] = data.split('_').slice(1);
      const fieldMap = {
        LocationName: "LocationName",
        LocationShortCode:"LocationShortCode",
       
        

      };
      bot.deleteMessage(chatId, messageId).then(()=>{
        bot.sendMessage(chatId, `Please enter a new ${fieldMap[action]}:`, createCancelKeyboard());

      })

      
      bot.once('message', async (msg) => {
        const updatedValue = msg.text;
  
        // Here, you would update the technician's information in your database
        await updateLocationAttribute(adminId, action, updatedValue);
        
        bot.sendMessage(chatId, `${fieldMap[action]} updated successfully!`);
  
        // Optionally, redisplay the technician details after the update
         try {
            const technician = await getLocationById(adminId);
            if (technician) {
              displayLocationDetailsWithEditOptions(chatId, technician);
              // bot.deleteMessage(chatId,messageId)
            } else {
              bot.sendMessage(chatId, `Technician with ID ${adminId} not found.`);
            }
          } catch (error) {
            console.error('Error fetching technician details:', error);
            bot.sendMessage(chatId, 'An error occurred while fetching the technician details.');
          }
      });
    }
   
 
  });

  bot.on('callback_query', async (query) => {
    const callbackData = query.data; // Get the callback data
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // Split the callback data
    const [action, machineId, status] = callbackData.split('_');

    if (action === 'ChangeLocationStatus') {
      bot.deleteMessage(chatId, messageId);
        // Function to create inline keyboard
        const createInlineKeyboard = (status) => {
            return {
                inline_keyboard: [
                    [
                        {
                            text: status === "1" ? '🟢 Make It Inactive' : '🔴 Make It Active',
                            callback_data: `buttonLocationActive_${machineId}_${status === "1" ? 0 : 1}`,
                        }
                    ]
                ]
            };
        };

        // Send a message asking to select status with inline keyboard
        await bot.sendMessage(chatId, `Please select status:`, {
            reply_markup: createInlineKeyboard(status),
        });

    } 
    else if (action === 'buttonLocationActive') {
        

        // Update the technician's status in the database
        await updateLocationStatus(machineId, status);
// Optionally, redisplay the technician details after the update
try {
    const machine = await getLocationById(machineId);
    if (machine) {
      displayLocationDetailsWithEditOptions(chatId, machine);
      
      bot.deleteMessage(chatId,messageId)
    } else {
      bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
    }
  } catch (error) {
    console.error('Error fetching machine details:', error);
    bot.sendMessage(chatId, 'An error occurred while fetching the machine details.');
  }
        // Notify the user
        await bot.sendMessage(chatId, `Status for machine has been changed to ${status}.`);
    }
    else if(action === 'deleteLocation'){
      const machine = await deleteLocationById(machineId);
    if (machine) {
      bot.deleteMessage(chatId, messageId).then(()=>{
  
      bot.sendMessage(chatId, `Machine with ID ${machineId} has been deleted.`);
      getAllLocationsData(chatId)
            
    })
    } else {
      bot.sendMessage(chatId, `machine with ID ${machineId} not found.`);
    }
    }
});


async function displayLocationDetailsWithEditOptions(chatId, machine) {
  const machineId = machine.id;
   const status = machine.status
   const statusMessage = `Status: ${status === "1" ? '🟢 Active' : '🔴 InActive'}`

  const message = `Updated Location Details:\n Location  Name: ${machine.LocationName} \n Location  Code:${machine.LocationShortCode} \n${statusMessage}`;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
          [{ text: 'Edit Location Name', callback_data: `LocationUpdate_LocationName_${machineId}` },{ text: 'Edit Location Code', callback_data: `LocationUpdate_LocationShortCode_${machineId}` }],
 
          [{ text: 'Edit Status', callback_data: `ChangeLocationStatus_${machineId}_${status}` },{ text: 'Delete Location', callback_data: `deleteLocation_${machineId}` }],
          [{ text: 'Back', callback_data: 'LocationBack' }],

      ],
    },
  };
  
  return bot.sendMessage(chatId, message, options)
  .then(sentMessage => sentMessage.message_id);  // Return the messageId
    }


bot.on('polling_error', (error) => {
  console.log(error);  // Log polling errors
});



//generate machine 

// Function to get all technician data (mock implementation for demonstration)
async function s(chatId) {
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
bot.onText(/\/pdf/, async (msg) => {
  const chatId = msg.chat.id;
  const all = await getAllTechnicianData(chatId);

  if (!all) {
      await bot.sendMessage(chatId, 'No data found.');
      return;
  }

  // Format the fetched data for the PDF
  const formattedContent = all.map(item => {
      return `Machine Name: ${item.machineName}\nShort Code: ${item.machineShortCode}\nStatus: ${item.status ? "Active" : "Inactive"}\n\n`;
  }).join('');

  // Sample data to be included in the PDF
  const data = {
      title: 'Machine Data PDF',
      content: formattedContent,
      date: new Date().toLocaleString(),
  };


  

  // Create a PDF document
  const doc = new PDFDocument();
  const pdfPath = `./output-${chatId}.pdf`;

  // Pipe the document to a file
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Add content to the PDF
  doc.fontSize(25).text(data.title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(data.content);
  doc.moveDown();
  doc.fontSize(12).text(`Generated on: ${data.date}`, { align: 'right' });

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

bot.onText(/\/getexcel/, async (msg) => {
  const chatId = msg.chat.id;
  const all = await getAllTechnicianData(chatId);

  if (!all) {
      await bot.sendMessage(chatId, 'No data found.');
      return;
  }



   // Create a new workbook and a worksheet
   const workbook = new ExcelJS.Workbook();
   const worksheet = workbook.addWorksheet('Machine Data');

   // Define columns for the worksheet
   worksheet.columns = [
       { header: 'Machine Name', key: 'machineName', width: 20 },
       { header: 'Short Code', key: 'machineShortCode', width: 15 },
       { header: 'Status', key: 'status', width: 10 },
       { header: 'Created At', key: 'created_at', width: 25 },
       { header: 'Updated At', key: 'updated_at', width: 25 },
   ];

   // Add rows to the worksheet
   all.forEach(item => {
       worksheet.addRow({
           machineName: item.machineName,
           machineShortCode: item.machineShortCode,
           status: item.status ? "Active" : "InActive",
           created_at: item.created_at,
           updated_at: item.updated_at
       });
   });

   const excelPath = `./output-${chatId}.xlsx`;

   // Write the workbook to a file
   await workbook.xlsx.writeFile(excelPath);

   // Send the Excel file to the user
   bot.sendDocument(chatId, excelPath)
       .then(() => {
           // Delete the file after sending
           fs.unlinkSync(excelPath);
           console.log('Excel file sent and deleted successfully.');
       })
       .catch((err) => {
           console.error('Error sending the Excel file:', err);
       });
});


async function handleTechnicianData(chatId) {
  try {
    const technician = await getTechnicianByChatId(chatId);
    if (technician) {
      const previewMessage = `
      👷‍♂️ *Technician Preview* 👷‍♂️
      First Name: ${technician.firstName}
      Last Name: ${technician.lastName}
      Phone: ${technician.phone}
      Email: ${technician.email}
      Skills: ${technician.skills}
      Experience: ${technician.experience} years
      `;
      const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
   
                [ { text: 'Close', callback_data: 'closeProfile' } ],
            ],
        },
    };
  
       await bot.sendMessage(chatId, previewMessage,options);
      userRegistration[chatId] = null;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching technician:', error);
    await bot.sendMessage(chatId, 'There was an error checking your registration status.');
    return false;
  }
}
const signatureUrl = 'https://b13a-196-189-127-247.ngrok-free.app/signature';
const signatureUrl1 = 'https://b13a-196-189-127-247.ngrok-free.app/order';
const login = 'https://9bca-196-188-115-255.ngrok-free.app/login'
const urlData = {}

// Start command handler
bot.onText(/\/jobassesment/, async (msg) => {
    const chatId = msg.chat.id;
    const data1 = await getCompanyById(1);
    const data = await getTechnicianByChatId(chatId);
    bot.sendMessage(msg.chat.id, "Welcome to the Technician Management System! Use   to add a technician.", {
      reply_markup: replyTechnitianMarkup
    });
    // Fetch user details
   
    if(data1){
    }

    console.log(data1);
    if(data1){
      
   
    // Encode user data for URL
    // const params = new URLSearchParams({
    //     chat_id: chatId,
    //     email: encodeURIComponent(data.email),
    //     firstName: encodeURIComponent(data.firstName),
    //     lastName: encodeURIComponent(data.lastName),
    //     phone: encodeURIComponent(data.phone), // Ensure phone number is encoded
    // }).toString();
    const params = new URLSearchParams({
      job_id: 20,
      // CompanyName: encodeURIComponent(data1.CompanyName),
      // CompanyShortCode: encodeURIComponent(data1.CompanyShortCode),
    
  }).toString();
    console.log(`Generated URL: ${login}?${params}`);
    urlData[chatId] = `${login}?${params}`; // Store the encoded params for later use

    // Send the registration form URL to the user
    bot.sendMessage(chatId, 'Welcome! Click the button below to open the registration form.', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Register',
                    web_app: {
                        url: `${login}?${params}`
                    }
                }]
            ]
        }
    });

  }
});

// //post job
let jobRegistration = {}; // Temporary storage for job details

bot.onText(/Add Job/, (msg) => {
    const chatId = msg.chat.id;

    jobRegistration[chatId] = {
        step: 'job_title'
    };
    bot.sendMessage(chatId, "Please enter the job's title:");
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!jobRegistration[chatId] || jobRegistration[chatId].isEditingJob) return;

    const registration = jobRegistration[chatId];

    switch (registration.step) {
        case 'job_title':
            registration.jobTitle = text;
            registration.step = 'job_description';
            bot.sendMessage(chatId, 'Please enter the job description:');
            break;
        case 'job_description':
            registration.jobDescription = text;
            registration.step = 'job_location';
            displayLocations(chatId)
            // bot.sendMessage(chatId, 'Please enter the job location:');
            break;
        case 'job_location':
            registration.location = text;
            registration.step = 'client_name';
            displayCompany(chatId)
            // bot.sendMessage(chatId, 'Please enter the client name:');
            break;
        case 'client_name':
            registration.CompanyName = text;
            registration.step = 'contact_number';
            bot.sendMessage(chatId, 'Please enter the contact number:');
            break;
        case 'contact_number':
            registration.contactNumber = text;
            registration.step = 'start_date';
            bot.sendMessage(chatId, 'Please enter the start date (YYYY-MM-DD):');
            break;
        case 'start_date':
            registration.startDate = text;
            registration.step = 'start_time';
            bot.sendMessage(chatId, 'Please enter the start time (HH:MM):');
            break;
        case 'start_time':
            registration.startTime = text;
            registration.step = 'preview';
            displayJobRegistrationDetails(chatId);
            break;
        default:
            bot.sendMessage(chatId, 'Registration step not recognized. Please start over.');
            break;
    }
});
async function displayJobRegistrationDetails(chatId) {
  const registration = jobRegistration[chatId];
  const previewMessage = `
  👷‍♂️ *Job Preview* 👷‍♂️
  Job Title: ${registration.jobTitle || 'Not set'}
  Description: ${registration.jobDescription || 'Not set'}
  Location: ${registration.location || 'Not set'}
  Client Name: ${registration.CompanyName || 'Not set'}
  Contact Number: ${registration.contactNumber || 'Not set'}
  Start Date: ${registration.startDate || 'Not set'}
  Start Time: ${registration.startTime || 'Not set'}
  `;

  const options = {
      parse_mode: 'Markdown',
      reply_markup: {
          inline_keyboard: [
              [{ text: 'Edit Job Title', callback_data: 'editJob_jobTitle' }, { text: 'Edit Description', callback_data: 'editJob_jobDescription' }],
              [{ text: 'Edit Location', callback_data: 'editJobLocation_location' }, { text: 'Edit Company Name', callback_data: 'editJobCompany_CompanyName' }],
              [{ text: 'Edit Contact Number', callback_data: 'editJob_contactNumber' }, { text: 'Edit Start Date', callback_data: 'editJob_startDate' }],
              [{ text: 'Edit Start Time', callback_data: 'editJob_startTime' }],
              [{ text: 'Confirm', callback_data: 'confirmJob' }, { text: 'Close', callback_data: 'JobClose' }],
          ],
      },
  };

  if (!registration.previewMessageId) {
    const sentMessage = await bot.sendMessage(chatId, previewMessage, options);
    registration.previewMessageId = sentMessage.message_id;
    registration.previewMessageContent = previewMessage;
    registration.previewMessageOptions = options;
} else {
    if (registration.previewMessageContent === previewMessage && JSON.stringify(registration.previewMessageOptions) === JSON.stringify(options)) {
        bot.sendMessage(chatId, 'You have entered the same message.');
        return;
    }

    try {
        await bot.editMessageText(previewMessage, {
            chat_id: chatId,
            message_id: registration.previewMessageId,
            parse_mode: 'Markdown',
            reply_markup: options.reply_markup
        });
        registration.previewMessageContent = previewMessage;
        registration.previewMessageOptions = options;
    } catch (error) {
        if (error.response && error.response.body && error.response.body.description === 'Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message') {
            bot.sendMessage(chatId, 'The message has not been modified.');
        } else {
            console.error('Error editing message:', error);
            bot.sendMessage(chatId, 'An error occurred while editing the message.');
        }
    }
}
}
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const action = data.split('_')[0];
  const field = data.split('_')[1];

  if (action === 'editJob') {
      const fieldMap = {
          jobTitle: "jobTitle",
          jobDescription: "jobDescription",
          location: "location",
          CompanyName: "CompanyName",
          contactNumber: "contactNumber",
          startDate: "startDate",
          startTime: "startTime",
      };

      if (fieldMap[field]) {
          jobRegistration[chatId].isEditingJob = true;

          bot.sendMessage(chatId, `Please enter a new ${fieldMap[field]}:`);

          bot.once('message', async (msg) => {
              const text = msg.text;
              jobRegistration[chatId][fieldMap[field]] = text;
              jobRegistration[chatId].isEditingJob = false;

              await displayJobRegistrationDetails(chatId); // Re-display the preview after editing

              bot.sendMessage(chatId, `${fieldMap[field]} updated successfully!`, {
                  reply_to_message_id: jobRegistration[chatId].previewMessageId
              });
          });
      } else {
          bot.sendMessage(chatId, 'Invalid field selected for editing.');
      }

  } else if (data === 'confirmJob') {
      displayTechnicians(chatId);

  } else if (data === 'JobClose') {
      const messageId = jobRegistration[chatId].previewMessageId;
      bot.deleteMessage(chatId, messageId).then(() => {
          delete jobRegistration[chatId];
      });

  } else if (action === 'selectTechnician') {
      const technicianId = data.split('_')[1];
      sendJobDetailsToTechnician(chatId, technicianId);

  } else if (action === 'editJobLocation') {
displayLocations(chatId)
      bot.once('message', async (msg) => {
          const text = msg.text;
          jobRegistration[chatId].location = text;

          await displayJobRegistrationDetails(chatId); // Re-display the preview after editing

          bot.sendMessage(chatId, `Location updated successfully!`, {
              reply_to_message_id: jobRegistration[chatId].previewMessageId
          });
      });
  }else if (action === 'editJobCompany') {
    displayCompany(chatId)
          bot.once('message', async (msg) => {
              const text = msg.text;
              jobRegistration[chatId].CompanyName = text;
    
              await displayJobRegistrationDetails(chatId); // Re-display the preview after editing
    
              bot.sendMessage(chatId, `Company updated successfully!`, {
                  reply_to_message_id: jobRegistration[chatId].previewMessageId
              });
          });
      }
});


async function displayTechnicians(chatId) {
    const technicians = AllUserInfo[chatId].technicianData;

    const inlineKeyboard = technicians.map((tech) => [
        {
            text: tech.firstName,
            callback_data: `selectTechnician_${tech.id}`
        }
    ]);

    bot.sendMessage(chatId, 'Please select a technician:', {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    });
}
async function displayLocations(chatId) {
  const locations = AllUserInfo[chatId].locationData;

  // Create a keyboard layout from locations
  const keyboard = locations.map((loc) => [
      {
          text: loc.LocationName
      }
  ]);

  // Create the keyboard markup with options
  const options = {
      reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true, // Resize keyboard to fit the screen
          one_time_keyboard: true // Hide the keyboard after selection
      }
  };

  // Send the message with the custom keyboard
  bot.sendMessage(chatId, 'Please select a location:', options);
}
async function displayCompany(chatId) {
  const companies = AllUserInfo[chatId].companyData;

  // Create a keyboard layout from companies
  const keyboard = companies.map((loc) => [
      {
          text: loc.CompanyName
      }
  ]);

  // Create the keyboard markup with options
  const options = {
      reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true, // Resize keyboard to fit the screen
          one_time_keyboard: true // Hide the keyboard after selection
      }
  };

  // Send the message with the custom keyboard
  bot.sendMessage(chatId, 'Please select a company:', options);
}

function sendJobDetailsToTechnician(chatId, technicianId) {
    getTechnicianById(technicianId).then((technician) => {
        const registration = jobRegistration[chatId];
          console.log(technician)
        if (!technician || !technician.chat_id) {
            bot.sendMessage(chatId, 'Sorry, no technician found with that ID or chat ID is missing.');
            return;
        }

const jobMessage = `
*Job Title:* ${registration.jobTitle}
*Description:* ${registration.jobDescription}
*Location:* ${registration.location}
*Company Name:* ${registration.CompanyName}
*Contact Number:* ${registration.contactNumber}
*Start Date:* ${registration.startDate}
*Start Time:* ${registration.startTime}
        `;
        
        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Confirm', callback_data: `confirmJob_${chatId}` },
                        { text: 'Cancel', callback_data: `cancelJob_${chatId}` }
                    ]
                ]
            }
        };
        
        bot.sendMessage(technician.chat_id, jobMessage, options);
        
        bot.sendMessage(chatId, `Job details sent to technician: ${technician.firstName}`);

        // Clear registration data
        delete jobRegistration[chatId];
    }).catch((error) => {
        console.error('Error fetching technician:', error);
        bot.sendMessage(chatId, 'Sorry, there was an error sending the job details.');
    });
}
const pendingUploads = {}; // To track pending uploads for each chatId

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const action = data.split('_')[0];
    const targetChatId = data.split('_')[1];

    if (action === 'confirmJob') {
        // Set the state to expect a document upload
        pendingUploads[chatId] = targetChatId;

        // Ask the user to upload a PDF
        bot.sendMessage(chatId, 'Please upload the PDF document for the job.');
    } else if (action === 'cancelJob') {
        // Handle job cancellation
        bot.sendMessage(targetChatId, 'Job cancelled.');
    }
});

// const createJobDetailsMessage = (details) => {
//   return `
// <b>Job Details:</b>\n
// <b>Job Title:</b> ${details.job.title}\n
// <b>Description:</b> ${details.job.description}\n
// <b>Company:</b> ${details.job.company}\n
// <b>Location:</b> ${details.job.location}\n
// <b>Reference:</b> ${details.job.Reference}\n
// <b>Salary:</b> ${details.job.salary}\n
// <b>Created At:</b> ${new Date(details.job.created_at).toLocaleString()}\n
// <b>Updated At:</b> ${new Date(details.job.updated_at).toLocaleString()}\n\n

// <b>Technician Details:</b>\n
// <b>Name:</b> ${details.technician.firstName} ${details.technician.lastName}\n
// <b>Phone:</b> ${details.technician.phone}\n
// <b>Email:</b> ${details.technician.email}\n
// <b>Username:</b> ${details.technician.username}\n\n

// <b>Additional Info:</b>\n
// <b>Step:</b> ${details.step}\n
// <b>Departure Location:</b> ${details.departureLocation}\n
// <b>Dispatch Time:</b> ${details.dispatchTime}\n
// <b>ETA:</b> ${details.eta}\n
// <b>Driver:</b> ${details.driver}
// `;
// };
// In-memory storage for user data
const userResponses = {}; // Store responses temporarily

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const callbackData = query.data;
  const [action, job_id, technician_id,Reference] = callbackData.split('_');

  if (action === 'approveJob') {
    await bot.answerCallbackQuery(query.id, { text: 'Job approved!' });

    const messageText = query.message.text;
    const jobDetails = messageText.split('\n').reduce((acc, line) => {
      const [key, ...valueParts] = line.split(': ');
      if (key && valueParts.length > 0) {
        acc[key.trim()] = valueParts.join(': ').trim();
      }
      return acc;
    }, {});

    const job_id = jobDetails['Job ID'];

    userResponses[chatId] = {
      chatId,
      job_id,
      reference: jobDetails['Job Reference'],
      title: jobDetails['Title'],
      description: jobDetails['Description'],
      company: jobDetails['Company'],
      location: jobDetails['Location'],
      status: jobDetails['Status'],
      firstName: jobDetails['First Name'],
      lastName: jobDetails['Last Name'],
      departureLocation: '',
      dispatchTime: '',
      eta: '',
 
      technician_id,
      step: 'departureLocation',
    };

    await bot.sendMessage(chatId, 'Please provide the departure location:');

  } else if (action === 'rejectJob') {
    await bot.answerCallbackQuery(query.id, { text: 'Job rejected!' });
    await bot.sendMessage(channelId, `Job ID ${job_id}  has been rejected. Reference: ${Reference}`);
    await updateJobConfirmStatus(job_id, "0")
    await bot.sendMessage(chatId, 'Dispatch details cannot be confirmed as the job was rejected.');
  }
});
const confirmationMessage = {}

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in km
  return distance;
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text 

if (userResponses[chatId]) {
  const response = userResponses[chatId];
  const job = await getJobById(response.job_id);

  const jobLatitude = job.latitude;
  const jobLongitude = job.longitude;

  // console.log(jobLatitude, jobLongitude);

  if (text === '') {
    await bot.sendMessage(chatId, 'Please provide a valid response.');
    return;
  }

  if (response.step === 'departureLocation') {
    response.departureLocation = text;
    response.step = 'dispatchTime';
    await bot.sendMessage(chatId, 'Please provide the dispatch time (e.g., 14:00):');
  }else if (response.step === 'dispatchTime') {
    // Check if the dispatch time is in the correct format (e.g., 14:00)
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24-hour format HH:MM
  
    if (timePattern.test(text)) {
      
         const formattedTime = `${text}:00`;
        response.dispatchTime = formattedTime;

      response.step = 'location';
      await bot.sendMessage(chatId, 'Please share your location by clicking the button below:', {
        reply_markup: {
          keyboard: [
            [{ text: 'Share Location', request_location: true }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
  
      // Send the next prompt or confirmation to the user
     } else {
      // If the time is not in a valid format, prompt the user to re-enter the time
      await bot.sendMessage(chatId, 'Invalid time format. Please provide the dispatch time in the correct format (e.g., 14:00):');
    }
  }
  
 else if (response.step === 'location') {
    if (msg.location) {  // Check if the message contains location data
      const userLatitude = msg.location.latitude;
      const userLongitude = msg.location.longitude;

      // Save the latitude and longitude
      response.location = { latitude: userLatitude, longitude: userLongitude };

      // Calculate the distance between the job and the user's location
      const distance = calculateDistance(jobLatitude, jobLongitude, userLatitude, userLongitude);

      if (distance <= 6) {
        response.step = 'eta';
        await bot.sendMessage(chatId, `Location received! You are within ${distance.toFixed(2)} km of the job site. Please provide the estimated time of arrival (e.g., 15:00):`,{
          reply_markup: mainTechMenuReplyMarkup
        });
      } else {
        await bot.sendMessage(chatId, `Your location is too far from the job site. You are ${distance.toFixed(2)} km away, which exceeds the 6 km range.`);
      }
    } else {
      await bot.sendMessage(chatId, 'Please share your location by clicking the button below:', {
        reply_markup: {
          keyboard: [
            [{ text: 'Share Location', request_location: true }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }
  } else if (response.step === 'eta') {
    // Check if the ETA is in the correct format (e.g., 14:00)
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24-hour format HH:MM
  
    if (timePattern.test(text)) {
       // Update the eta field
      const formattedTime = `${text}:00`;
      response.eta = formattedTime;
      response.step = 'preview'; // Proceed to the preview step

      const statusTech = `<b>Technician availability</b> : ${"Busy 🔴"}`;
      const confirmationMessage = `
<b>Date:</b> ${new Date().toLocaleDateString()}\n
<b>Job ID:</b> ${response.job_id}\n
<b>Job Reference:</b> ${response.reference}\n
<b>Title:</b> ${response.title}\n
<b>Description:</b> ${response.description}\n
<b>Company:</b> ${response.company}\n
<b>Location:</b> ${response.location.latitude}, ${response.location.longitude}\n
<b>Status:</b> ${response.status}\n
<b>First Name:</b> ${response.firstName}\n
<b>Last Name:</b> ${response.lastName}\n
${statusTech}\n
<b>Departure Location:</b> ${response.departureLocation}\n
<b>Dispatch Time:</b> ${response.dispatchTime}\n
<b>ETA:</b> ${response.eta}\n
      `;
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Confirm', callback_data: `postJob_${response.job_id}` },
              { text: 'Cancel', callback_data: 'cancelConfirmation' }
            ]
          ]
        }
      };
      const dispatchMessage = await bot.sendMessage(chatId, `Dispatch Confirmation:\n${confirmationMessage}`, { parse_mode: 'HTML', ...options });
      userResponses[chatId].dispatchMessageId = dispatchMessage.message_id;
    } else {
      // If the time format is incorrect, prompt the user to re-enter the ETA
      await bot.sendMessage(chatId, 'Invalid time format for ETA. Please provide the ETA in HH:MM format (e.g., 14:00):');
    }
  }

  
}

});

bot.on('callback_query', async (callbackQuery) => {
 
  const chatId = callbackQuery.message.chat.id;
  const response = userResponses[chatId];
  const callbackData = callbackQuery.data;
  const [action, job_id] = callbackData.split('_');

  if (action === 'postJob') {
    try {
      const jobfound = await getJobConfirmationById(job_id);
      if (jobfound) {
        await bot.sendMessage(chatId, "The Job Already Confirmed");
        return;
      }

      const statusTech = `<b>Technician availability</b> : ${"Busy 🔴"}`;
      const confirmationMessage = `
<b>Date:</b> ${new Date().toLocaleDateString()}\n
<b>Job ID:</b> ${response.job_id}\n
<b>Job Reference:</b> ${response.reference}\n
<b>Title:</b> ${response.title}\n
<b>Description:</b> ${response.description}\n
<b>Company:</b> ${response.company}\n
 
<b>Status:</b> ${response.status}\n
<b>First Name:</b> ${response.firstName}\n
<b>Last Name:</b> ${response.lastName}\n
${statusTech}\n
<b>Departure Location:</b> ${response.departureLocation}\n
<b>Dispatch Time:</b> ${response.dispatchTime}\n
<b>ETA:</b> ${response.eta}\n
 
      `;
      // Send the confirmation message to the channel
      const sentChannelMessage = await bot.sendMessage(channelId, `Dispatch Confirmed:\n${confirmationMessage}`, { parse_mode: 'HTML' });
      const postedMessageId = sentChannelMessage.message_id;

      await createJobConfirmation(response, postedMessageId);
      await updateAvailability(chatId, "0");
      await updateJobConfirmStatus(job_id, "3");

      // Optionally delete the original dispatch confirmation message
      if (response.dispatchMessageId) {
        await bot.deleteMessage(chatId, response.dispatchMessageId);
      }

      // Clear registration data
      delete userResponses[chatId];
      await bot.sendMessage(chatId, 'Dispatch confirmed and posted to the Lomiworks channel.');

    } catch (error) {
      console.error('Error confirming job:', error);
      await bot.sendMessage(chatId, 'There was an error confirming the job. Please try again later.');
    }
  } else if (action === 'cancelConfirmation') {
    if (response?.dispatchMessageId) {
      await bot.deleteMessage(chatId, response.dispatchMessageId);
      await updateJobConfirmStatus(job_id, "0");
      await updateAvailability(chatId, "1");

    }
    delete userResponses[chatId];
    await bot.sendMessage(chatId, 'Dispatch canceled.');
  }
});


// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const userResponse = msg.text;
//   const messageId = msg.message_id;

//   if (userResponses[chatId]) {
//     const step = userResponses[chatId].step;

//     switch (step) {
//       case 'departureLocation':
//         userResponses[chatId].departureLocation = userResponse;
//         bot.sendMessage(chatId, 'Dispatch Time (e.g., 4:04 AM):');
//         userResponses[chatId].step = 'dispatchTime';
//         break;

//       case 'dispatchTime':
//         userResponses[chatId].dispatchTime = userResponse;
//         bot.sendMessage(chatId, 'ETA (Estimated Time of Arrival):');
//         userResponses[chatId].step = 'eta';
//         break;

//       case 'eta':
//         userResponses[chatId].eta = userResponse;
//         bot.sendMessage(chatId, 'Driver Name:');
//         userResponses[chatId].step = 'driver';
//         break;

//       case 'driver':
//         userResponses[chatId].driver = userResponse;

//       //   const { jobDetails,job_id, technician_id } = userResponses[chatId];
//       //   const statusMessage = ` <b>Job Status</b>: ${  "On Progress 🟢" }`;
//       //   const statusTech = ` <b>Technician availability</b> : ${ "Busy 🔴" }`;
     
//       //   const dispatchDetails = `
//       //   <b>Date:</b> ${new Date().toLocaleDateString()}\n
//       //   <b>Departure Location:</b> ${userResponses[chatId].departureLocation}\n
//       //   <b>Dispatch Time:</b> ${userResponses[chatId].dispatchTime}\n
//       //   <b>Driver:</b> ${userResponses[chatId].driver}\n
//       //   <b>Job ID:</b> ${jobDetails['Job ID']}\n
//       //   <b>Job Reference:</b> ${jobDetails['Job Reference']}\n
//       //   <b>Title:</b> ${jobDetails['Title']}\n
//       //   <b>Description:</b> ${jobDetails['Description']}\n
//       //   <b>Company:</b> ${jobDetails['Company']}\n
//       //   <b>Location:</b> ${jobDetails['Location']}\n
//       //   <b>Status:</b> ${jobDetails['Status']}\n
//       //   <b>First Name:</b> ${jobDetails['First Name']}\n
//       //   <b>Last Name:</b> ${jobDetails['Last Name']}\n

//       //   <b>Created At:</b> ${jobDetails['Created At']}\n
//       //   <b>Updated At:</b> ${jobDetails['Updated At']}\n
//       // `;
      
        
//       // <b>Phone:</b> ${jobDetails['Phone']}\n
//       // <b>Email:</b> ${jobDetails['Email']}\n
//       // <b>Username:</b> ${jobDetails['Username']}\n
//         // console.log( jobDetails)
//         bot.deleteMessage(chatId, messageId);

//         const options = {
//           reply_markup: {
//             inline_keyboard: [
//               [
//                 { text: 'Confirm', callback_data: 'confirm' },
//                 { text: 'Cancel', callback_data: 'cancelConfirmation' }
//               ]
//             ]
//           }
//         };

//         try {

//          const mes =  await bot.sendMessage(chatId, `Dispatch Confirmation:\n${createJobDetailsMessage(userResponses[chatId])}`, {parse_mode: 'HTML',...options} );
//           const deleteMessage = mes.message_id;
//           delete dispatchDetails;
//           // bot.deleteMessage(chatId, deleteMessage)
//           // Store the message ID to DB if needed
//           // await storeMessageIdToDb(userResponses[chatId], postedMessageId);

//           // Handle callback queries
//           bot.on('callback_query', async (callbackQuery) => {
//             const action = callbackQuery.data;
//             if (action === 'confirm') {
//               try {
//                 // Send confirmation message to the channel
//                 const formattedMessage = createJobDetailsMessage(userResponses[chatId]);

//                 const sentChannelMessage = await bot.sendMessage(channelId, `Dispatch Confirmed:\n${formattedMessage}`,{ parse_mode: 'HTML'});
//                 const postedMessageId = sentChannelMessage.message_id;
       
//                 const  jobfound = await getJobConfirmationById(job_id) 
//                 console.log(jobfound)
//                 if(jobfound){
//                   bot.sendMessage(chatId, "The Job Already Confirmed")
//                 }
       
//                 await createJobConfirmation(userResponses[chatId], postedMessageId);
//                 await updateAvailability(chatId, "0");
//                 await updateJobConfirmStatus(job_id, "3");

             
        
//                 // Optionally delete the original dispatch confirmation message
//                 // await bot.deleteMessage(chatId, dispatchMessageId);
        
//                 // Clear registration data
//                 bot.deleteMessage(chatId,deleteMessage).then(()=>{
//                   bot.sendMessage(chatId, 'Dispatch confirmed and posted to the Lomiworks channel.');
//                   bot.sendMessage(chatId, `Company added with ID: `);
  
//                 })              
                
//               } catch (error) {
//                 console.error('Error confirming job:', error);
//                 bot.sendMessage(chatId, 'There was an error confirming the job. Please try again later.');
//               }
//             } else if (action === 'cancelConfirmation') {
//               bot.deleteMessage(chatId,deleteMessage).then(()=>{
//                 bot.sendMessage(chatId, 'Dispatch canceled.');

//                 delete userResponses[chatId];

//               })
//             }
//           });
//         } catch (error) {
//           console.error('Error sending dispatch confirmation:', error);
//           bot.sendMessage(chatId, 'There was an error sending the dispatch confirmation. Please try again later.');
//         }
//         break;
//     }
//   }
// });

bot.onText(/Active Jobs/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const activeJobs = await getActiveTechnicianJobs(chatId,'1');
 

    if (activeJobs.length > 0) {
      activeJobs.forEach(job => {
        const { jobId, job_id, departureLocation, dispatchTime, eta, status, messageId ,Reference,
          company,
          location,
          firstName,
          lastName,
          phone,
          title,
          job_description} = job;

        const messageText = `
<b>Job Status: ${status === "1" ? "In Progress 🟢" : "Completed 🔵"}</b>\n
<b>Job ID:</b> ${job_id} 
<b>Job Reference:</b> ${Reference}
        
<b>Date:</b> ${new Date().toLocaleDateString()}
             
<b>Company Name:</b> ${company}
<b>Location:</b> ${location}
             
<b>Departure Location:</b> ${departureLocation}
<b>Dispatch Time:</b> ${dispatchTime}
<b>ETA:</b> ${eta}
             
<b>Technician:</b> ${firstName} ${lastName}
<b>Technician's Phone:</b> ${phone}
             
<b>Service Type:</b> ${title}
<b>Service Description:</b> ${job_description}
             
 
             `;
             
        
 
        const options = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Complete', callback_data: `complete_${jobId}_${messageId}_${job_id}` },
                { text: 'Cancel', callback_data: `cancelJob_${jobId}_${messageId}_${job_id}` }
              ]
            ]
          }
        };
  
        bot.sendMessage(chatId, messageText, {parse_mode: 'HTML',...options}  );
      });
    }
   
   else {
      bot.sendMessage(chatId, "No active jobs found.");
    }
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    bot.sendMessage(chatId, 'There was an error fetching active jobs. Please try again later.');
  }
});
async function constructMessage(chatId,job_id,jobId) {
  try {
   const job =  await getJobs(chatId,job_id,jobId)
  //   const technician = await getTechnicianByChatId(chatId);
  //   if (!technician) throw new Error('Technician not found');
 
  //  const job = await getJobById(job_id);
 
  //   if (!job) throw new Error('No job details found');
  //   const jobConfirm = await getJobConfirmationById(jobId);
  //   if (!jobConfirm) throw new Error('No job details found');
    // Yellow: 🟡
    // Blue: 🔵
 
     const statusMessage = `Job Status: ${ job.status === "0" ? "In Progress 🟢" : "Completed 🔵"}`;
    //  console.log("this is serve" ,job)
     const dispatchDetails = `
<b>${statusMessage}</b>
<b>Job Reference:</b> ${ job.Reference}

<b>Date:</b> ${new Date().toLocaleDateString()}
     
<b>Company Name:</b> ${ job.company}
<b>Location:</b> ${ job.location}
     
<b>Departure Location:</b> ${ job.departureLocation}
<b>Dispatch Time:</b> ${ job.dispatchTime}
<b>ETA:</b> ${ job.eta}
     
<b>Technician:</b> ${ job.firstName} ${ job.lastName}
<b>Technician's Phone:</b> ${ job.phone}
<b>Username:</b> @${ job.username}
<b>Email:</b> ${ job.email}   

<b>Service Type:</b> ${ job.title}
<b>Service Description:</b> ${ job.job_description}
     
 

${ job.description ? ` <b>Technician Work Description:</b> ${ job.description }` : ''}


     `;
     

 


    return dispatchDetails;
  } catch (error) {
    console.error('Error constructing message:', error);
    throw error;
  }
}
async function constructCancelMessage(chatId,job_id,jobId) {
  try {
   const job =  await getJobs(chatId,job_id,jobId)
  //   const technician = await getTechnicianByChatId(chatId);
  //   if (!technician) throw new Error('Technician not found');
 
  //  const job = await getJobById(job_id);
 
  //   if (!job) throw new Error('No job details found');
  //   const jobConfirm = await getJobConfirmationById(jobId);
  //   if (!jobConfirm) throw new Error('No job details found');
    // Yellow: 🟡
    // Blue: 🔵
 
     const statusMessage = `Job Status: ${   "Canceled 🔴"  }`;
    //  console.log("this is serve" ,job)
     const dispatchDetails = `
<b>${statusMessage}</b>
<b>Job Reference:</b> ${ job.Reference}

<b>Date:</b> ${new Date().toLocaleDateString()}
     
<b>Company Name:</b> ${ job.company}
<b>Location:</b> ${ job.location}
     
<b>Departure Location:</b> ${ job.departureLocation}
<b>Dispatch Time:</b> ${ job.dispatchTime}
<b>ETA:</b> ${ job.eta}
     
<b>Technician:</b> ${ job.firstName} ${ job.lastName}
<b>Technician's Phone:</b> ${ job.phone}

<b>Username:</b> @${ job.username}
<b>Email:</b> ${ job.email}  

<b>Service Type:</b> ${ job.title}
<b>Service Description:</b> ${ job.job_description}
     
 

${ job.description ? ` <b>Technician Work Description:</b> ${ job.description }` : ''}


     `;
     

 


    return dispatchDetails;
  } catch (error) {
    console.error('Error constructing message:', error);
    throw error;
  }
}
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const callbackData = callbackQuery.data;

  // if (callbackData.startsWith('complete_')) {
  //   const [_, jobId, messageId,id] = callbackData.split('_');
  //   try {

  //     await updateJobStatus(jobId, '1');
  //     await updateAvailability(chatId, "1");
  //     const dispatchDetails = await constructMessage(chatId,jobId,id);
   

  //     await bot.editMessageText(dispatchDetails, {
  //       chat_id: channelId,
  //       message_id: messageId
  //     });
      
  //     await bot.sendMessage(chatId, 'Job marked as complete and posted to the Lomiworks channel.');

  //   } catch (error) {
  //     console.error('Error completing job:', error);
  //     await bot.sendMessage(chatId, 'There was an error marking the job as complete. Please try again later.');
  //   }
  // } 

  if (callbackData.startsWith('complete') ){
    const { id, data, message } = callbackQuery;
   
    const [_, jobId, messageId,job_id] = callbackData.split('_');
  

    const user = await getTechnicianByChatId(chatId);
    // Decrypt the user's password
    const decryptedPassword = user.chat_id;

    // Construct the URL with the email and decrypted password as params
    const url = `https://887e-196-188-115-255.ngrok-free.app/autoLogin?email=${encodeURIComponent(user.email)}&chat_id=${encodeURIComponent(decryptedPassword)}`;
 
  const newOptions = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Complete Job', callback_data: `button1_${jobId}_${messageId}_${job_id}` },
         
          
        ]
      ]
    }
  };

  // Edit the original message to include the new inline buttons
  await bot.editMessageText('Please choose an option:', {
    chat_id: message.chat.id,
    message_id: message.message_id,
    ...newOptions
  });

  // Optionally send a confirmation to the user
  await bot.answerCallbackQuery(id, { text: 'Options updated!' });
}
  // else if (callbackData.startsWith('cancel_')) {
  //   const [_, jobId, messageId] = callbackData.split('_');
  //   try {
  //     await bot.editMessageText('Job cancelled.', {
  //       chat_id: chatId,
  //       message_id: messageId
  //     });
  //   } catch (error) {
  //     console.error('Error cancelling job:', error);
  //     await bot.sendMessage(chatId, 'There was an error cancelling the job. Please try again later.');
  //   }
  // }
  
});

 
// Handle callback queries
const jobDescriptions = {}; // Temporary in-memory storage for job descriptions

bot.on('callback_query', async (callbackQuery) => {
  const { id, data, message } = callbackQuery;

  const [action, jobId, messageId, job_id] = data.split('_');

  const chatId = message.chat.id;


  if (action === 'button1') {
    bot.sendMessage(chatId, 'Please enter a description for the job:').then(() => {
      bot.once('message', (msg) => {
        if (msg.chat.id === chatId) { // Ensure the message is from the correct chat
          const description = msg.text;
          console.log(`Received description: ${description}`);

          // Store the description with the jobId
          jobDescriptions[jobId] = description;
          console.log(`Stored description for JobId ${jobId}: ${description}`);

          // Use the jobId in the callback_data
          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: 'Confirm', callback_data: `confirm_${jobId}_${messageId}_${job_id}` },
                  { text: 'Cancel', callback_data: `cancelJob_${jobId}_${messageId}_${job_id}` }
                ]
              ]
            }
          };
          
          bot.sendMessage(chatId, `You entered: "${description}". Confirm or cancel?`, options);
        }
      });
    });
  } 
  else if (action === 'confirm'  ) {
 
    const description = jobDescriptions[jobId]; 
 
    if (description) {
      if (action === 'confirm') {

        
        
        try {
          await simpleConfirm(description, jobId);
          await updateJobConfirmStatus(job_id, '2');
          await updateJobStatus(jobId, '2');
          await updateAvailability(chatId, "1");
          const dispatchDetails = await constructMessage(chatId,job_id,jobId);
       
        
  
  await bot.editMessageText(dispatchDetails, {
    chat_id: channelId,
    message_id: messageId,
    parse_mode: 'HTML' // Ensure HTML parsing is enabled
  });
          
          await bot.sendMessage(chatId, 'Job marked as complete and posted to the Lomiworks channel.');
    
        } catch (error) {
          console.error('Error completing job:', error);
          await bot.sendMessage(chatId, 'There was an error marking the job as complete. Please try again later.');
        }
        await bot.sendMessage(chatId, `Job ${jobId.split('_')[0]} confirmed with description: "${description}"`);
        // Additional logic to handle job confirmation
      } else if (action === 'cancel') {
        bot.sendMessage(chatId, `Job ${jobId.split('_')[0]} has been canceled.`);
        // Additional logic to handle job cancellation
      }
      delete jobDescriptions[jobId]; // Clean up the stored description
    } 
  }
  else if (action === 'cancelJob') {
 
    const description = jobDescriptions[jobId]; 
 
   
        
        try {
          await simpleConfirm(description, jobId);
          await updateJobConfirmStatus(job_id, '0');
          await updateJobStatus(jobId, '0');
          await updateAvailability(chatId, "1");
          const dispatchDetails = await constructCancelMessage(chatId,job_id,jobId);
       
        console.log(messageId)
  
  await bot.editMessageText(dispatchDetails, {
    chat_id: channelId,
    message_id: messageId,
    parse_mode: 'HTML' // Ensure HTML parsing is enabled
  });
          
          await bot.sendMessage(chatId, 'Job marked as complete and posted to the Lomiworks channel.');
          delete jobDescriptions[jobId]; // Clean up the stored description

        } catch (error) {
          console.error('Error completing job:', error);
          await bot.sendMessage(chatId, 'There was an error marking the job as complete. Please try again later.');
        }
        await bot.sendMessage(chatId, `Job ${jobId.split('_')[0]} confirmed with description: "${description}"`);
        // Additional logic to handle job confirmation
      }  
   
});

// Handle document uploads
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    const document = msg.document;

    // Check if the document is a PDF
    if (document.mime_type === 'application/pdf') {
        const fileId = document.file_id;

        try {
            // Retrieve the file path
            const file = await bot.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

            console.log('Retrieved file URL:', fileUrl); // Debugging log

            // Get the target chat ID from pending uploads
            const targetChatId = pendingUploads[chatId];

            if (targetChatId) {
                // Send the PDF document to the technician
                await bot.sendDocument(targetChatId, fileId, { caption: 'Here is the PDF document.' });

                // Send confirmation to the user
                bot.sendMessage(chatId, 'PDF document has been sent to the technician.');

                // Clean up the pending upload state
                delete pendingUploads[chatId];
            } else {
                bot.sendMessage(chatId, 'No technician to send the document to.');
            }
        } catch (error) {
            console.error('Error handling PDF upload:', error);
            bot.sendMessage(chatId, 'Failed to process the PDF document. Please try again.');
        }
    } else {
        bot.sendMessage(chatId, 'Please upload a valid PDF document.');
    }
});
// Function to format the job details
// Function to format the job details

// Listen for "Get Job" command
bot.onText(/Get Job/, async (msg) => {
  const chatId = msg.chat.id;

// Fetch the job details
const jobs = await getMyJob(chatId, '1');

if (jobs.length > 0) {
  // Iterate over each job and send a message
  jobs.forEach((job) => {
    // Format the job details
    const message = `
<b>Job ID:</b> ${job.job_id}\n
<b>Job Reference:</b> ${job.Reference}\n

<b>Title:</b> ${job.title}\n
<b>Description:</b> ${job.description}\n
<b>Company:</b> ${job.company}\n
<b>Location:</b> ${job.location}\n
<b>Status:</b> ${job.status === '1' ? 'In Progress 🟢' : 'Completed 🔵'}\n
 
<b>First Name:</b> ${job.firstName}\n
<b>Last Name:</b> ${job.lastName}\n
<b>Phone:</b> ${job.phone}\n
<b>Email:</b> ${job.email}\n
<b>Username:</b> @${job.username}\n

<b>Created At:</b> ${new Date(job.created_at).toLocaleString()}
<b>Updated At:</b> ${new Date(job.updated_at).toLocaleString()}
    `;

    // Inline buttons for Approve and Reject
    const inlineButtons = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Approve', callback_data: `approveJob_${job.job_id}_${job.technician_id}_${job.Reference}` },
            { text: 'Reject', callback_data: `rejectJob_${job.job_id}_${job.technician_id}_${job.Reference}` }
          ]
        ]
      }
    };

    // Send the message with inline buttons
    bot.sendMessage(chatId, message, { parse_mode: 'HTML', ...inlineButtons });
  });
} else {
  // If no jobs are found, send a message to the user
  bot.sendMessage(chatId, 'No jobs found.');
}

});

bot.onText(/Work Done/, async (msg) => {
  const chatId = msg.chat.id;

// Fetch the job details
const jobs = await getWorkDone(chatId, '2');
 
if (jobs.length > 0) {
  // Iterate over each job and send a message
  jobs.forEach((job) => {
    // Format the job details
    const message = `
<b>Job ID:</b> ${job.job_id}\n
<b>Job Reference:</b> ${job.Reference}\n

<b>Title:</b> ${job.title}\n
<b>Description:</b> ${job.job_description}\n
<b>Company:</b> ${job.company}\n
<b>Location:</b> ${job.location}\n
<b>Status:</b> ${job.tech_status === '1' ? 'In Progress 🟢' : 'Completed 🔵'}\n

<b>First Name:</b> ${job.firstName}\n
<b>Last Name:</b> ${job.lastName}\n
<b>Phone:</b> ${job.phone}\n
<b>Email:</b> ${job.email}\n
<b>Username:</b> @${job.username}\n

<b>My Description:</b> ${job.description}\n

<b>Created At:</b> ${new Date(job.created_at).toLocaleString()}
<b>Updated At:</b> ${new Date(job.updated_at).toLocaleString()}
    `;

    // Inline buttons for Approve and Reject
    const inlineButtons = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Approve', callback_data: `approveJob_${job.job_id}_${job.technician_id}_${job.Reference}` },
            { text: 'Reject', callback_data: `rejectJob_${job.job_id}_${job.technician_id}_${job.Reference}` }
          ]
        ]
      }
    };

    // Send the message with inline buttons
    bot.sendMessage(chatId, message, { parse_mode: 'HTML'  });
  });
} else {
  // If no jobs are found, send a message to the user
  bot.sendMessage(chatId, 'No jobs found.');
}

});
const formatJobReport = (jobs) => {
  // Calculate the total salary
  const totalSalary = jobs.reduce((sum, job) => sum + parseFloat(job.salary || 0), 0);
  const totalJobs = jobs.length;
  console.log(jobs);
  // Create the report
  let report = `<b>Weekly Job Report</b>\n\n`;
  report += `<b>Total Salary:</b> ${totalSalary.toFixed(2)}\n\n`;
  report += `<b>Total Jobs:</b> ${totalJobs}\n\n`;
 
  jobs.forEach(job => {
    report += `
<b>Job ID:</b> ${job.Reference}\n
<b>Title:</b> ${job.title}\n
<b>Description:</b> ${job.description}\n
<b>Company:</b> ${job.company}\n
<b>Location:</b> ${job.location}\n
<b>Salary:</b> ${job.salary}\n
<b>Status:</b> ${job.jobs_status === '1' ? 'In Progress 🟢' : 'Completed 🔵'}\n
<b>Created At:</b> ${new Date(job.created_at).toLocaleString()  }\n
<b>Updated At:</b> ${new Date(job.updated_at).toLocaleString()}\n\n
<b>Technician Details:</b>\n
<b>First Name:</b> ${job.firstName}\n
<b>Last Name:</b> ${job.lastName}\n
<b>Phone:</b> ${job.phone}\n
<b>Email:</b> ${job.email}\n
<b>Username:</b> @${job.username}\n
  
    `;
  });

  return report;
};


bot.onText(/Week Report/, async(msg) => {
  const chatId = msg.chat.id;
 const jobs = await getWeekReport('2');
 
const jobReport = formatJobReport(jobs);

 
bot.sendMessage(chatId, jobReport,  {parse_mode: 'HTML'})

});
// Catch any unhandled exceptions and prevent the bot from crashing
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Optionally, you can log the error or send a notification to the admin
});

// Catch any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, you can log the rejection or send a notification to the admin
});

// Handle location sharing
bot.onText(/Share Location/, (msg) => {
  const chatId = msg.chat.id;
 

  // Send an inline button with a URL containing the chatId
  bot.sendMessage(chatId, 'Click below to share location .', {
      reply_markup: {
          inline_keyboard: [
            [{
              text: 'Open App', // Button text

              web_app: {
                  url: `https://lomistock.com/location?locationchatId=${chatId}`
              }
          }]
               
          ],
      },
  });
});

