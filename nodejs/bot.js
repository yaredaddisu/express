const TelegramBot = require('node-telegram-bot-api');
// const mysql = require('mysql');
const { employeesDB, db } = require('./db');

const token = '7335433164:AAGv8rjvnpNkIGBFAkYC8v8BmusjpNk2FsY'; // Replace with your bot token from BotFather
const bot = new TelegramBot(token, { polling: true });
const { v4: uuidv4 } = require('uuid'); // Ensure this import is at the top of your script
const axios = require('axios');
 
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root', // Replace with your MySQL username
//   // password: 'your_password', // Replace with your MySQL password
//   database: 'telegram_bot'
// });

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[0-9]{10}$/; // Adjust regex according to your requirements
  return phoneRegex.test(phone);
}

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to database:', err);
//     return;
//   }
//   console.log('Connected to MySQL database.');
// });

// const userStates = {};

const defaultKeyBoard = {
  reply_markup: {
    keyboard: [["My CV", "Profile"], ["Portfolio"], ["I'm robot"]],
    resize_keyboard: true
  }
};

const cancelKeyBoard = {
  reply_markup: {
    keyboard: [["Cancel"]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};
const removeKeyBoard = {
  reply_markup: {
    remove_keyboard: true
  }
};
const portfolioKeyBoard = {
  reply_markup: {
    keyboard: [["Make Portfolio","Close"]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};
const cancelButton = [["Cancel"]];
const userStates = {};

// Function to save the portfolio data to the database
function savePortfolio(chatId, id, userData) {
  db.query(
    'INSERT INTO portfolio (chat_id, user_id, linkedin, portfolio1, portfolio2, description) VALUES (?, ?, ?, ?, ?, ?)',
    [chatId, id, userData.linkedin, userData.portfolio1, userData.portfolio2, userData.description],
    (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error saving your portfolio. Please try again.');
        console.error('Error saving portfolio:', err);
      } else {
        bot.sendMessage(chatId, 'Your portfolio has been saved successfully.',defaultKeyBoard);
      }
    }
  );
}

// Function to get the user ID from the database
async function getUserIdFromDatabase(chatId) {
  return new Promise((resolve, reject) => {
    db.query('SELECT id FROM users WHERE chat_id = ?', [chatId], (err, results) => {
      if (err) {
        console.error('Error fetching user ID:', err);
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(results[0].id);
        } else {
          resolve(null); // User not found
        }
      }
    });
  });
}

// // Function to create a new user in the database
// async function createUserInDatabase(chatId) {
//   return new Promise((resolve, reject) => {
//     db.query('INSERT INTO users (chat_id) VALUES (?)', [chatId], (err, result) => {
//       if (err) {
//         console.error('Error creating user:', err);
//         reject(err);
//       } else {
//         resolve(result.insertId);
//       }
//     });
//   });
// }

// // Event handler for the /start command
// bot.onText(/\/start/, async (msg) => {
//   const chatId = msg.chat.id;
  
//   try {
//     let userId = await getUserIdFromDatabase(chatId);
//     if (!userId) {
//       userId = await createUserInDatabase(chatId);
//       bot.sendMessage(chatId, 'Welcome! Your account has been created.');
//     } else {
//       bot.sendMessage(chatId, 'Welcome back!');
//     }
//   } catch (error) {
//     console.error('Error during start process:', error);
//     bot.sendMessage(chatId, 'There was an error. Please try again later.');
//   }
// });
 
bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'Make Portfolio') {
 
  const chatId = msg.chat.id;

  try {
    const userId = await getUserIdFromDatabase(chatId);
    if (!userId) {
      bot.sendMessage(chatId, 'Please use /start to create an account first.');
    } else {
      userStates[chatId] = { step: 'enter_linkedin', userId };
      bot.sendMessage(chatId, 'Please enter your LinkedIn profile URL:');
    }
  } catch (error) {
    console.error('Error identifying user:', error);
    bot.sendMessage(chatId, 'There was an error. Please try again later.');
  }
}
});


// Event handler for any messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (userStates[chatId]?.step === 'linkedin_edit') {
    if (text.toLowerCase() === 'cancel') {
  userStates[chatId] = { step: 'linkedin_edit' };
  sendPortfolio(chatId);
} else {
const new_linkedin = text;
db.query('UPDATE portfolio SET linkedin = ? WHERE chat_id = ?', [new_linkedin, chatId], (err) => {
  if (err) {
    bot.sendMessage(chatId, 'Error updating your linkedin. Please try again.');
    console.error(err);
    return;
  }
  bot.sendMessage(chatId, 'Your linkedin has been updated successfully.');
  sendPortfolio(chatId);
  delete userStates[chatId];
});
}
  }
  if (userStates[chatId]?.step === 'portfolio1_edit') {
    if (text.toLowerCase() === 'cancel') {
  userStates[chatId] = { step: 'portfolio1_edit' };
  sendPortfolio(chatId);
} else {
const new_portfolio1 = text;
db.query('UPDATE portfolio SET portfolio1 = ? WHERE chat_id = ?', [new_portfolio1, chatId], (err) => {
  if (err) {
    bot.sendMessage(chatId, 'Error updating your portfolio1. Please try again.');
    console.error(err);
    return;
  }
  bot.sendMessage(chatId, 'Your portfolio one has been updated successfully.');
  sendPortfolio(chatId);
  delete userStates[chatId];
});
}
  }if (userStates[chatId]?.step === 'portfolio2_edit') {
    if (text.toLowerCase() === 'cancel') {
  userStates[chatId] = { step: 'portfolio2_edit' };
  sendPortfolio(chatId);
} else {
const new_portfolio2 = text;
db.query('UPDATE portfolio SET portfolio2 = ? WHERE chat_id = ?', [new_portfolio2, chatId], (err) => {
  if (err) {
    bot.sendMessage(chatId, 'Error updating your portfolio2. Please try again.');
    console.error(err);
    return;
  }
  bot.sendMessage(chatId, 'Your portfolio two has been updated successfully.');
  sendPortfolio(chatId);
  delete userStates[chatId];
});
}
  }if (userStates[chatId]?.step === 'description_edit') {
    if (text.toLowerCase() === 'cancel') {
  userStates[chatId] = { step: 'description_edit' };
  sendPortfolio(chatId);
} else {
const new_description = text;
db.query('UPDATE portfolio SET description = ? WHERE chat_id = ?', [new_description, chatId], (err) => {
  if (err) {
    bot.sendMessage(chatId, 'Error updating your description. Please try again.');
    console.error(err);
    return;
  }
  bot.sendMessage(chatId, 'Your description has been updated successfully.');
  sendPortfolio(chatId);
  delete userStates[chatId];
});
}
  }
  if (!userStates[chatId]) {
    return; // Ignore messages if user state is not set
  }

  switch (userStates[chatId].step) {
    case 'enter_linkedin':
      userStates[chatId].linkedin = text;
      userStates[chatId].step = 'enter_portfolio1';
      bot.sendMessage(chatId, 'Please enter your first portfolio link:');
      break;

    case 'enter_portfolio1':
      userStates[chatId].portfolio1 = text;
      userStates[chatId].step = 'enter_portfolio2';
      bot.sendMessage(chatId, 'Please enter your second portfolio link (or type "none" if you don\'t have one):');
      break;

    case 'enter_portfolio2':
      userStates[chatId].portfolio2 = text === 'none' ? null : text;
      userStates[chatId].step = 'enter_description';
      bot.sendMessage(chatId, 'Please enter a brief description of your portfolio:');
      break;

    case 'enter_description':
      userStates[chatId].description = text;
      savePortfolio(chatId, userStates[chatId].userId, userStates[chatId]);
      delete userStates[chatId];
      break;

    default:
      break;
  }
});





bot.onText(/\/start(?:\s+apply_(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const jobId = match[1];  // This will capture the entire UUID if provided
 
  // Function to handle user registration
  const handleUserRegistration = () => {
    db.query('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, results) => {
      if (err) {
        bot.sendMessage(chatId, 'Error accessing the database.');
        console.error(err);
        return;
      }

      if (results.length > 0) {
        userStates[chatId] = { step: 'registered' };
        bot.sendMessage(chatId, 'Welcome back! Please choose an option:', defaultKeyBoard);
      } else {
        bot.sendMessage(chatId, 'Welcome! Please register by entering your first name:');
        userStates[chatId] = { step: 'registering' };
      }
    });
  };

  // Function to handle job details
  const handleJobDetails = (jobId) => {
    employeesDB.query('SELECT * FROM jobs WHERE id = ?', [jobId], (err, results) => {
      if (err) {
        bot.sendMessage(chatId, 'Error accessing the job details.');
        console.error(err);
        return;
      }

      if (results.length === 0) {
        bot.sendMessage(chatId, 'Job not found.');
        return;
      }

      const job = results[0];
      const jobDetailsMessage = `
        Job Details:

        *Job Title:* ${job.job_title}
        *Job Sector:* ${job.job_sector}
        *Job Location:* ${job.job_location}
        *Education Requirements:* ${job.job_education}
        *Experience Requirements:* ${job.job_experience}
        *Vacancies:* ${job.job_vacancies}
        *Salary:* ${job.job_salary}
        *Deadline:* ${job.job_deadline}
        *Description:* ${job.description}
      `;
      const options = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Apply', callback_data: `applyJob_${job.id}` }]
          ]
        }
      };

      bot.sendMessage(chatId, jobDetailsMessage, options);
    });
  };

  // If jobId is provided, handle job details and skip registration prompt
  if (jobId) {
    handleJobDetails(jobId);
  } else {
    // No jobId provided, proceed with user registration
    handleUserRegistration();
  }
});

bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('applyJob_')) {
    const jobId = data.slice('applyJob_'.length); // Extract the full UUID
    handleApplyShortly(chatId, jobId);
    // Present options to "Apply Shortly" or "Apply Fully"
    // const applyOptions = {
    //   reply_markup: {
    //     inline_keyboard: [
    //       [{ text: 'Apply Shortly', callback_data: `applyShortly_${jobId}` }],
    //       [{ text: 'Cancel', callback_data: 'cancel' }]
    //     ]
    //   }
    // };

    // bot.sendMessage(chatId, ` Choose an option:`, applyOptions);
    bot.answerCallbackQuery(callbackQuery.id);
  // } else if (data.startsWith('applyShortly_')) {
  //   const jobId = data.slice('applyShortly_'.length);
  //   handleApplyShortly(chatId, jobId);
  //   bot.answerCallbackQuery(callbackQuery.id);
  // } else if (data.startsWith('applyFully_')) {
  //   const jobId = data.slice('applyFully_'.length);
  //   startFullApplicationProcess(chatId, jobId);
  //   bot.answerCallbackQuery(callbackQuery.id);
    }
});
const handleApplyShortly = (chatId, jobId) => {
  userStates[chatId] = { ...userStates[chatId], jobId };
  db.query('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Error retrieving user information. Please try again.');
      console.error('Error retrieving user information:', err);
      return;
    }

    if (results.length === 0) {
      bot.sendMessage(chatId, 'User information not found. Please register first.');
      return;
    }

    const user = results[0];
    const userId = user.id;

    // Check if the user has already applied for the job
    employeesDB.query(
      'SELECT * FROM applications WHERE job_id = ? AND user_id = ?',
      [jobId, userId],
      (err, results) => {
        if (err) {
          bot.sendMessage(chatId, 'Error checking application status. Please try again.');
          console.error('Error checking application status:', err);
          return;
        }

        if (results.length > 0) {
          // Job already applied for
          bot.sendMessage(chatId, 'You have already applied for this job.');
        } else {

 
  // Fetch job details
  employeesDB.query('SELECT * FROM jobs WHERE id = ?', [jobId], (err, jobResults) => {
    if (err) {
      bot.sendMessage(chatId, 'Error accessing job details.');
      console.error(err);
      return;
    }

    if (jobResults.length === 0) {
      bot.sendMessage(chatId, 'Job not found.');
      return;
    }

    const job = jobResults[0];

    // Fetch user information
    db.query('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, userResults) => {
      if (err) {
        bot.sendMessage(chatId, 'Error accessing your information.');
        console.error(err);
        return;
      }

      if (userResults.length === 0) {
        bot.sendMessage(chatId, 'No existing information found. Please register first.');
        return;
      }

      const user = userResults[0];
     

      // Fetch user's portfolio
      db.query('SELECT * FROM portfolio WHERE user_id = ?', [user.id], (err, portfolioResults) => {
        if (err) {
          bot.sendMessage(chatId, 'Error accessing your portfolio.');
          console.error(err);
          return;
        }

        if (portfolioResults.length === 0) {
          bot.sendMessage(chatId, 'No portfolio information found. Please complete your profile first.');
          return;
        }

 
        const portfolio = portfolioResults[0];

        // Store user, job, and portfolio information in user state
        userStates[chatId] = {
          step: 'previewing',
          jobId: jobId,
          user: user,
          portfolio: portfolio,
          jobTitle: job.job_title,
          employeeId: job.chat_id,
          cvFileId: user.cv_file_id
        };
        
        // Format the preview message
        const previewMessage = `
        *Application Preview:*
        
        *Job Title:* ${job.job_title}
        
        *Name:* ${user.first_name} ${user.last_name}
        *DOB:* ${new Date(user.dob).toLocaleDateString()}
        *Gender:* ${user.gender}
        *Education:* ${user.education}
        *Residence:* ${user.residence}
        *Phone:* ${user.phone}
        *Email:* ${user.email}
        
        *LinkedIn:* [${portfolio.linkedin}](${portfolio.linkedin})
        
        *Portfolio 1:* [${portfolio.portfolio1}](${portfolio.portfolio1})
        
        *Portfolio 2:* [${portfolio.portfolio2}](${portfolio.portfolio2})
        
        *Description:*
        ${portfolio.description}
        `;
        
        // Inline buttons for editing options
        const options = {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Edit First Name', callback_data: 'update_firstName' ,resize_keyboard: true}, { text: 'Edit Last Name', callback_data: 'update_lastName' ,resize_keyboard: true}],
              [{ text: 'Edit Date of Birth', callback_data: 'update_dob' ,resize_keyboard: true}, { text: 'Edit Gender', callback_data: 'update_gender' ,resize_keyboard: true}],
              [{ text: 'Edit Residence Location', callback_data: 'update_residence' ,resize_keyboard: true}, { text: 'Edit Phone Number', callback_data: 'update_phone' ,resize_keyboard: true}],
              [{ text: 'Edit Email', callback_data: 'update_email' ,resize_keyboard: true}, { text: 'Edit Education', callback_data: 'update_education' ,resize_keyboard: true}],
              [{ text: 'Edit LinkedIn', callback_data: 'update_linkedin' ,resize_keyboard: true}, { text: 'Edit Portfolio One', callback_data: 'update_portfolio1' ,resize_keyboard: true}],
              [{ text: 'Edit Portfolio Two', callback_data: 'update_portfolio2' ,resize_keyboard: true}, { text: 'Edit Description', callback_data: 'update_description' ,resize_keyboard: true}],
              [{ text: 'Edit Resume', callback_data: 'update_cvFileId' ,resize_keyboard: true}],
              [{ text: 'Apply Shortly', callback_data: `confirm_apply_shortly_${jobId}` ,resize_keyboard: true},{ text: 'Cancel', callback_data: 'cancel' ,resize_keyboard: true}],
            ]
          }
        };
        
        // Send the preview message with inline buttons
        bot.sendMessage(chatId, previewMessage, options);
     
 
        bot.sendDocument(chatId, user.cv_file_id , {
          caption: 'Here is your CV for preview.'
        });
        
      });
    });
  });
}
    });
  });
};
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;
  const messageId = msg.message_id; // Get the message ID to delete later
  const state = userStates[chatId];

  if (!state) {
    bot.sendMessage(chatId, 'Invalid state. Please try again.');
    return;
  }

  const { user, portfolio, jobId,employeeId } = state;

  if (data.startsWith('update_')) {
    const attribute = data.split('_')[1];
    userStates[chatId].step = 'updating';
    userStates[chatId].editAttribute = attribute;

    bot.deleteMessage(chatId, msg.message_id).then(() => {
      let messageText;
      let keyboardOptions = cancelKeyBoard;

      switch (attribute) {
        case 'email':
          messageText = 'Please enter your new email:';
          break;
        case 'firstName':
          messageText = 'Please enter your new first name:';
          break;
        case 'lastName':
          messageText = 'Please enter your new last name:';
          break;
        case 'dob':
          messageText = 'Please enter your new date of birth (YYYY/MM/DD):';
          break;
        case 'gender':
          messageText = 'Please enter your new gender:';
          keyboardOptions = {
            reply_markup: {
              keyboard: [["Male", "Female"], ...cancelButton],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          };
          break;
        case 'residence':
          messageText = 'Please enter your new residence location:';
          break;
        case 'phone':
          messageText = 'Please enter your new phone number:';
          break;
          case 'cvFileId':
          messageText = 'Please upload cv (PDF):';
          break;
        case 'education':
          messageText = 'Please enter your new education:';
          keyboardOptions = {
            reply_markup: {
              keyboard: [["Degree", "Masters", "PhD"], ["Diploma", "Certificate"], ...cancelButton],
              one_time_keyboard: true
            }
          };
          break;
        case 'linkedin':
          messageText = 'Please enter your new LinkedIn:';
          break;
        case 'portfolio1':
          messageText = 'Please enter your new Portfolio One:';
          break;
        case 'portfolio2':
          messageText = 'Please enter your new Portfolio Two:';
          break;
        case 'description':
          messageText = 'Please enter your new description:';
          break;
        default:
          messageText = 'Invalid attribute. Please try again.';
          break;
      }

      bot.sendMessage(chatId, messageText, keyboardOptions);
    });
  } else if (data.startsWith('confirm_apply_shortly_')) {
    if (state.step !== 'previewing' || state.jobId !== jobId) {
      bot.sendMessage(chatId, 'Invalid application state. Please try again.');
      return;
    }
    const id = uuidv4();
    userStates[chatId].id = id; // Store job ID
        
    const botToken = '7305758400:AAGX5psZombntqRyg-AqkBo6_B66pWuM6zM'; // Replace with your bot's API token

    const sendDocument = async (employeeId, fileId) => {
      const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
      try {
        const response = await axios.post(url, {
          chat_id: employeeId,
          document: fileId,
          caption: 'Applicant Resume'
        });
        return response.data;
      } catch (error) {
        console.error('Error sending document:', error);
        throw error;
      }
    };
    
    const sendMessage = async (chatId, text, options) => {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      try {
        const response = await axios.post(url, {
          chat_id: chatId,
          text: text,
          ...options
        });
        return response.data;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    };
    
    const main = async () => {
      const userState = userStates[chatId];
    
      if (!userState) {
        console.log('No state found for this chat ID.');
        return;
      }
    
      const user = userState.user;
      const jobId = userState.jobId;
      const employeeId = userState.employeeId;
      const portfolio = userState.portfolio;
      const jobTitle = userState.jobTitle;
      const cvFileId = user.cv_file_id;
    
      // Format the preview message
      const previewMessage = `
    Application Preview:
    
    *Job Title:* ${jobTitle}
    
    *Name:* ${user.first_name} ${user.last_name}
    
    *DOB:* ${new Date(user.dob).toLocaleDateString()}
    
    *Gender:* ${user.gender}
    
    *Education:* ${user.education}
    
    *Residence:* ${user.residence}
    
    *Phone:* ${user.phone}
    
    *Email:* ${user.email}
    
    *LinkedIn:* [${portfolio.linkedin}](${portfolio.linkedin})
    
    *Portfolio 1:* [${portfolio.portfolio1}](${portfolio.portfolio1})
    
    *Portfolio 2:* [${portfolio.portfolio2}](${portfolio.portfolio2})
    
    *Description:*
    ${portfolio.description}
    `;
    
      // Define the options for the message
      const options = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Apply Shortly', callback_data: `confirm_apply_shortly_${jobId}` }, { text: 'Cancel', callback_data: 'cancel' }],
          ]
        }
      };
    
      try {
        const documentResponse = await sendDocument(employeeId, cvFileId);
        console.log('Document sent:', documentResponse);
    
        const messageResponse = await sendMessage(employeeId, previewMessage, options);
        console.log('Message sent:', messageResponse);
    
        const confirmationResponse = await bot.sendMessage(chatId, 'Your application has been successfully submitted. Thank you!');
        console.log('Confirmation sent:', confirmationResponse);
    
        // Insert application into the database
        employeesDB.query(
          'INSERT INTO applications (id, job_id, user_id, first_name, last_name, dob, gender, education, residence, phone, email, linkedin, portfolio1, portfolio2, description, cv_file_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, jobId, user.id, user.first_name, user.last_name, user.dob, user.gender, user.education, user.residence, user.phone, user.email, portfolio.linkedin, portfolio.portfolio1, portfolio.portfolio2, portfolio.description, user.cv_file_id],
          (err) => {
            if (err) {
              bot.sendMessage(chatId, 'Error saving your application. Please try again.');
              console.error('Error saving application:', err);
              return;
            }
    
            // Clean up user state after processing
            delete userStates[chatId];
          }
        );
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    // Execute the main function
    main();
  } 

  if (data === 'cancel') {
    // Delete the message that triggered the callback
    bot.deleteMessage(chatId, messageId)
      .then(() => {
        // Optionally send a cancellation message or perform other cleanup
        bot.sendMessage(chatId, 'Application process has been cancelled.');

        // Clean up any user states or data related to the cancelled process
        delete userStates[chatId];
      })
      .catch((error) => {
        console.error('Error deleting message:', error);
      });
  } 

});
 
  // const botToken = '7305758400:AAGX5psZombntqRyg-AqkBo6_B66pWuM6zM'; // Replace with your bot's API token
  // const botUsername = '@LomiTestTest_bot'; // Replace with your bot's username
   // Function to send the message using Telegram Bot API
// const sendMessage = async (chatId, text, options = {}) => {
//   const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
//   try {
//     const response = await axios.post(url, {
//       chat_id: chatId,
//       text: text,
//       ...options
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error sending message:', error.response ? error.response.data : error.message);
//     throw error;
//   }
// };

// // Example function to handle confirming application shortly
// const handleConfirmApplyShortly = async (chatId, jobId, user, portfolio, cvFileId, jobTitle, employeeId) => {
//   try {
//     // Example file path to the CV
//     const filePath = path.join(__dirname, 'path/to/your/large/document.pdf');

//     // Format the preview message
//     const previewMessage = `
//       Application Preview:

//       *Job Title:* ${jobTitle}
//       *Name:* ${user.first_name} ${user.last_name}
//       *DOB:* ${new Date(user.dob).toLocaleDateString()}
//       *Gender:* ${user.gender}
//       *Education:* ${user.education}
//       *Residence:* ${user.residence}
//       *Phone:* ${user.phone}
//       *Email:* ${user.email}
//       *LinkedIn:* [${portfolio.linkedin}](${portfolio.linkedin})
//       *Portfolio 1:* [${portfolio.portfolio1}](${portfolio.portfolio1})
//       *Portfolio 2:* [${portfolio.portfolio2}](${portfolio.portfolio2})
//       *Description:*
//       ${portfolio.description}
//     `;

//     // Define the options for the message
//     const options = {
//       parse_mode: 'Markdown',
//       reply_markup: {
//         inline_keyboard: [
//           [{ text: 'Approve', callback_data: 'approve' }],
//           [{ text: 'Reject', callback_data: 'reject' }]
//         ]
//       }
//     };

//     // Send resume and message
//     async function sendResumeAndMessage(chatId, resumePath) {
//       try {
//           // Implement your logic to send the resume and message here
//           // Example:
//           await bot.sendDocument(chatId, resumePath, { caption: 'Here is your resume' });
//           await bot.sendMessage(chatId, 'Your resume has been sent successfully!');
//       } catch (error) {
//           console.error('Error sending resume and message:', error);
//           throw error; // Optionally re-throw the error for higher-level error handling
//       }
//   }
// }
  
//   bot.on('callback_query', async (callbackQuery) => {
//     const chatId = callbackQuery.message.chat.id;
//     const data = callbackQuery.data;
  
//     // Check if the callback data starts with 'confirm_apply_shortly_'
//     if (data.startsWith('confirm_apply_shortly_')) {
//       const jobId = data.replace('confirm_apply_shortly_', ''); // Extract job ID from callback data
  
//       // Assuming you have access to user state and necessary data (user, portfolio, cvFileId, jobTitle, employeeId)
//       const userState = userStates[chatId];
//       if (!userState || userState.step !== 'previewing' || userState.jobId !== jobId) {
//         await sendMessage(chatId, 'Invalid application state. Please try again.');
//         return;
//       }
  
//       const { user, portfolio, jobTitle, employeeId } = userState;
  
//       try {
//         await handleConfirmApplyShortly(chatId, jobId, user, portfolio, user.cv_file_id, jobTitle, employeeId);
//       } catch (error) {
//         console.error('Error handling application:', error);
//         await sendMessage(chatId, 'Error processing your application. Please try again later.');
//       }
//     } else {
//       // Handle other callback scenarios if needed
//       console.log('Unhandled callback data:', data);
//     }
//   });
  
 
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const state = userStates[chatId];

  if (state && state.step === 'updating') {
    const attribute = state.editAttribute;

    if (text && text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      handleApplyShortly(chatId, state.jobId);
      return;
    }

    if (attribute === 'cvFileId') {
      if (msg.document && msg.document.mime_type === 'application/pdf') {
        const newCvFileId = msg.document.file_id;

        db.query('UPDATE users SET cv_file_id = ? WHERE chat_id = ?', [newCvFileId, chatId], (err) => {
          if (err) {
            bot.sendMessage(chatId, 'Error updating your CV.');
            console.error(err);
            return;
          }

          bot.sendMessage(chatId, 'Your CV has been updated successfully.', defaultKeyBoard);
          delete userStates[chatId];
          handleApplyShortly(chatId, state.jobId);
        });
      } else {
        bot.sendMessage(chatId, 'Please upload a valid PDF file for your CV.');
      }
    }
  }
});
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const state = userStates[chatId];

  if (state && state.step === 'updating') {
    const attribute = state.editAttribute;

    if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
             handleApplyShortly(chatId, state.jobId);

      return;
    }
    if (['linkedin', 'portfolio1', 'portfolio2', 'description'].includes(attribute)) {
      const portfolioColumn = attribute;
      const newValue = text;

      db.query(`UPDATE portfolio SET ${portfolioColumn} = ? WHERE user_id = ?`, [newValue, state.user.id], (err) => {
        if (err) {
          bot.sendMessage(chatId, `Error updating your ${attribute}. Please try again.`);
          console.error(err);
          return;
        }

        bot.sendMessage(chatId, `Your ${attribute} has been updated successfully.`, defaultKeyBoard);
        delete userStates[chatId];
               handleApplyShortly(chatId, state.jobId);

      });
    } else {
      const userColumn = {
        email: 'email',
        firstName: 'first_name',
        lastName: 'last_name',
        dob: 'dob',
        gender: 'gender',
        residence: 'residence',
        phone: 'phone',
        education: 'education',
        // cvFileId: 'cv_file_id',

      }[attribute];
       
      const newValue = text;

      db.query(`UPDATE users SET ${userColumn} = ? WHERE chat_id = ?`, [newValue, chatId], (err) => {
        if (err) {
          bot.sendMessage(chatId, `Error updating your ${attribute}. Please try again.`);
          console.error(err);
          return;
        }

         
        bot.sendMessage(chatId, `Your ${attribute} has been updated successfully.`, defaultKeyBoard);
        delete userStates[chatId];
        handleApplyShortly(chatId, state.jobId);
      });
    }
  }
});

// const startFullApplicationProcess = (chatId, jobId) => {
//   userStates[chatId] = { step: 'applying', subStep: 'collectResume', jobId: jobId };
//   bot.sendMessage(chatId, 'You have started the full application process. Please provide your resume.');
// };

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   const userState = userStates[chatId];

//   if (userState && userState.step === 'applying') {
//     switch (userState.subStep) {
//       case 'collectResume':
//         userState.resume = msg.text;
//         userState.subStep = 'collectCoverLetter';
//         bot.sendMessage(chatId, 'Please provide your cover letter.');
//         break;

//       case 'collectCoverLetter':
//         userState.coverLetter = msg.text;
//         userState.subStep = 'collectAdditionalInfo';
//         bot.sendMessage(chatId, 'Please provide any additional information or type "None".');
//         break;

//       case 'collectAdditionalInfo':
//         userState.additionalInfo = msg.text;
        
//         // Finalize the application process
//         finalizeApplication(chatId, userState);
//         break;

//       default:
//         // Start with collecting the resume
//         userState.subStep = 'collectResume';
//         bot.sendMessage(chatId, 'Please provide your resume.');
//     }
//   } else if (!userState || userState.step !== 'applying') {
//     // Handle registration or other non-application messages here
//   }
// });

// Function to finalize the application process
// const finalizeApplication = (chatId, userState) => {
//   const { jobId, resume, coverLetter, additionalInfo } = userState;

//   // Save application details to the database
//   db.query('INSERT INTO applications (job_id, chat_id, resume, cover_letter, additional_info) VALUES (?, ?, ?, ?, ?)', [jobId, chatId, resume, coverLetter, additionalInfo], (err) => {
//     if (err) {
//       bot.sendMessage(chatId, 'Error saving your application. Please try again.');
//       console.error('Error saving application:', err);
//       return;
//     }

//     bot.sendMessage(chatId, 'Your application has been successfully submitted. Thank you!');
    
//     // Clean up user state
//     delete userStates[chatId];
//   });
// };


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;


  if (userStates[chatId]?.step === 'edit_email') {
    if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      sendProfile(chatId);
    } else {
    const newEmail = text;
    db.query('UPDATE users SET email = ? WHERE chat_id = ?', [newEmail, chatId], (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error updating your email. Please try again.');
        console.error(err);
        return;
      }
      if (isValidEmail(text)) {
        // Save email to user profile
        // userProfile[chatId].email = text;
        bot.sendMessage(chatId, 'Your email has been updated successfully.', defaultKeyBoard);
        delete userStates[chatId];
        sendProfile(chatId);
      } else {
        bot.sendMessage(chatId, 'Invalid email address. Please enter a valid email:', cancelKeyBoard);
      }
      // bot.sendMessage(chatId, 'Your email has been updated successfully.');
      //       sendProfile(chatId);

      // delete userStates[chatId];
    });
  }
  }if (userStates[chatId]?.step === 'edit_first_name') {
        if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      
      sendProfile(chatId);
    } else {
    const new_first_name = text;
    db.query('UPDATE users SET first_name = ? WHERE chat_id = ?', [new_first_name, chatId], (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error updating your first name. Please try again.');
        console.error(err);
        return;
      }
      bot.sendMessage(chatId, 'Your first name has been updated successfully.');
            sendProfile(chatId);

      delete userStates[chatId];
    });
  }
  }if (userStates[chatId]?.step === 'edit_last_name') {
        if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      sendProfile(chatId);
    } else {
    const new_last_name = text;
    db.query('UPDATE users SET last_name = ? WHERE chat_id = ?', [new_last_name, chatId], (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error updating your last name. Please try again.');
        console.error(err);
        return;
      }
      bot.sendMessage(chatId, 'Your last name has been updated successfully.');
            sendProfile(chatId);

      delete userStates[chatId];
    });
  }
  }if (userStates[chatId]?.step === 'edit_dob') {
        if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      sendProfile(chatId);
    } else {
    const newDob = text;
    db.query('UPDATE users SET dob = ? WHERE chat_id = ?', [newDob, chatId], (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error updating your date og birth. Please try again.');
        console.error(err);
        return;
      }
      bot.sendMessage(chatId, 'Your date og birth has been updated successfully.');
            sendProfile(chatId);

      delete userStates[chatId];
    });
  }
  }if (userStates[chatId]?.step === 'edit_gender') {
        if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      sendProfile(chatId);
    } else {
    const newGender = text;
    db.query('UPDATE users SET gender = ? WHERE chat_id = ?', [newGender, chatId], (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error updating your gender. Please try again.');
        console.error(err);
        return;
      }
      bot.sendMessage(chatId, 'Your gender has been updated successfully.',defaultKeyBoard);
            sendProfile(chatId);

      delete userStates[chatId];
    });
  }
  }if (userStates[chatId]?.step === 'edit_residence') {
        if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      sendProfile(chatId, defaultKeyBoard);
    } else {
    const newResidence = text;
    db.query('UPDATE users SET residence = ? WHERE chat_id = ?', [newResidence, chatId], (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error updating your residence. Please try again.');
        console.error(err);
        return;
      }
      bot.sendMessage(chatId, 'Your residence has been updated successfully.');
            sendProfile(chatId);

      delete userStates[chatId];
    });
  }
  }if (userStates[chatId]?.step === 'edit_phone') {
        if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      sendProfile(chatId);
    } else {
    const newPhone = text;
    db.query('UPDATE users SET email = ? WHERE chat_id = ?', [newPhone, chatId], (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error updating your phone. Please try again.');
        console.error(err);
        return;
      }
      if (isValidPhone(text)) {
        // Save phone to user profile
        // userProfile[chatId].phone = text;
        bot.sendMessage(chatId, 'Your phone has been updated successfully.',defaultKeyBoard);
        sendProfile(chatId);

        delete userStates[chatId];
      } else {
        bot.sendMessage(chatId, 'Invalid phone number. Please enter a valid phone number:', cancelKeyBoard);
      }
    
    });
  }
  }if (userStates[chatId]?.step === 'edit_education') {
        if (text.toLowerCase() === 'cancel') {
      userStates[chatId] = { step: 'registered' };
      sendProfile(chatId);
    } else {
    const newEducation = text;
    db.query('UPDATE users SET education = ? WHERE chat_id = ?', [newEducation, chatId], (err) => {
      if (err) {
        bot.sendMessage(chatId, 'Error updating your education. Please try again.');
        console.error(err);
        return;
      }
      bot.sendMessage(chatId, 'Your education has been updated successfully.', defaultKeyBoard);
            sendProfile(chatId);

      delete userStates[chatId];
    });
  }
  }

  if (userStates[chatId]?.step === 'registering') {
    if (!userStates[chatId].firstName) {
      userStates[chatId].firstName = text;
      bot.sendMessage(chatId, 'Please enter your last name:');
    } else if (!userStates[chatId].lastName) {
      userStates[chatId].lastName = text;
      bot.sendMessage(chatId, 'Please enter your date of birth (YYYY/MM/DD):');
    } else if (!userStates[chatId].dob) {
      userStates[chatId].dob = text;
      bot.sendMessage(chatId, 'Please enter your gender:',{
        reply_markup: {
          keyboard: [["Male", "Female" ]],
          one_time_keyboard: true
        }
      });
     
    } else if (!userStates[chatId].gender) {
      userStates[chatId].gender = text;
      bot.sendMessage(chatId, 'Please enter your residence location:');
    } else if (!userStates[chatId].residence) {
      userStates[chatId].residence = text;
      bot.sendMessage(chatId, 'Please enter your phone number:');
    } else if (!userStates[chatId].phone) {
      if (isValidPhone(text)) {
        userStates[chatId].phone = text;
        bot.sendMessage(chatId, 'Please enter your email:');
      } else {
        bot.sendMessage(chatId, 'Invalid phone number. Please enter a valid phone number:');
      }
    } else if (!userStates[chatId].email) {
      if (isValidEmail(text)) {
        userStates[chatId].email = text;
        bot.sendMessage(chatId, 'Please select your education:', {
          reply_markup: {
            keyboard: [["Degree", "Masters", "PhD"], ["Diploma", "Certificate"]],
            one_time_keyboard: true
          }
        });
      } else {
        bot.sendMessage(chatId, 'Invalid email. Please enter a valid email:');
      }
    }
    else if (!userStates[chatId].education) {
      userStates[chatId].education = text;
      bot.sendMessage(chatId, 'Please upload your CV as a PDF document:');
      userStates[chatId].step = 'uploading_cv';
    }

    
  }
  
  else if (msg.document && userStates[chatId]?.step === 'uploading_cv') {
    if (msg.document.mime_type === 'application/pdf') {
      const cvFileId = msg.document.file_id;
      const { firstName, lastName, dob, gender, residence, phone, email, education } = userStates[chatId];

      db.query(
        'INSERT INTO users (chat_id, first_name, last_name, dob, gender, residence, phone, email, education, cv_file_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [chatId, firstName, lastName, dob, gender, residence, phone, email, education, cvFileId],
        (err) => {
          if (err) {
            bot.sendMessage(chatId, 'Error registering. Please try again.');
            console.error(err);
            return;
          }
          // bot.sendMessage(chatId, 'Registration successful. Let\'s create your portfolio. Please enter your LinkedIn profile URL:');
          // userStates[chatId] = { step: 'enter_linkedin' };

          bot.sendMessage(chatId, 'Thank you for registering! You can now use the options.',portfolioKeyBoard);
          userStates[chatId] = { step: 'registered' };
        }
      );
    } else {
      bot.sendMessage(chatId, 'Invalid file type. Please upload a PDF document.');
    }
  }
  
 
  else if (text === "My CV") {
    db.query('SELECT cv_file_id FROM users WHERE chat_id = ?', [chatId], (err, results) => {
      if (err) {
        bot.sendMessage(chatId, 'Error accessing the database.');
        console.error(err);
        return;
      }

      if (results.length > 0) {
        const cvFileId = results[0].cv_file_id;
        const options = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Change', callback_data: 'change_cv' }, { text: 'Close', callback_data: 'close' }]
            ]
          }
        };

        bot.sendDocument(chatId, cvFileId, options);
      } else {
        bot.sendMessage(chatId, 'No CV found. Please upload your CV using /start.');
      }

      
    });
  } 
  else if (text === "Portfolio") {


    db.query('SELECT * FROM portfolio WHERE chat_id = ?', [chatId], (err, results) => {
      if (err) {
        bot.sendMessage(chatId, 'Error accessing the database.');
        console.error(err);
        return;
      }

      if (results.length > 0) {
        const user = results[0];
        const infoMessage = `
*Linked In:* ${user.linkedin}
*Portfolio One:* ${user.portfolio1}
*Portfolio Two:* ${user.portfolio2}
*Description:* ${user.description}
 
`;

const options = {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Edit LinkedIn', callback_data: 'linkedin_edit' }, { text: 'Edit Portfolio One', callback_data: 'portfolio1_edit' }],
      [{ text: 'Edit Portfolio Two', callback_data: 'portfolio2_edit' }, { text: 'Edit Description', callback_data: 'description_edit' }],
      [{ text: 'Close', callback_data: 'close' }]
    ]
  }
};


        bot.sendMessage(chatId, infoMessage, options);
      } else {
        bot.sendMessage(chatId, 'You are not registered. Please use /start to register.');
      }
    });
  }
  else if (text === "Profile") {
    
    db.query('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, results) => {
      if (err) {
        bot.sendMessage(chatId, 'Error accessing the database.');
        console.error(err);
        return;
      }

      if (results.length > 0) {
        const user = results[0];
        const infoMessage = `
*First Name:* ${user.first_name}
*Last Name:* ${user.last_name}
*Date of Birth:* ${user.dob}
*Gender:* ${user.gender}
*Residence Location:* ${user.residence}
*Phone Number:* ${user.phone}
*Email:* ${user.email}
*Education:* ${user.education}
`;

const options = {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Edit First Name', callback_data: 'edit_first_name' ,resize_keyboard: true}, { text: 'Edit Last Name', callback_data: 'edit_last_name' ,resize_keyboard: true}],
      [{ text: 'Edit Date of Birth', callback_data: 'edit_dob' ,resize_keyboard: true}, { text: 'Edit Gender', callback_data: 'edit_gender' ,resize_keyboard: true}],
      [{ text: 'Edit Residence Location', callback_data: 'edit_residence' ,resize_keyboard: true}, { text: 'Edit Phone Number', callback_data: 'edit_phone' ,resize_keyboard: true}],
      [{ text: 'Edit Email', callback_data: 'edit_email' ,resize_keyboard: true}, { text: 'Edit Education', callback_data: 'edit_education' ,resize_keyboard: true}],
      [{ text: 'Close', callback_data: 'close' }]
    ]
  }
};


        bot.sendMessage(chatId, infoMessage, options);
      } else {
        bot.sendMessage(chatId, 'You are not registered. Please use /start to register.');
      }
    });
  } else if (msg.document && userStates[chatId]?.step === 'change_cv') {
    if (msg.document.mime_type === 'application/pdf') {
      const newCvFileId = msg.document.file_id;

      db.query('UPDATE users SET cv_file_id = ? WHERE chat_id = ?', [newCvFileId, chatId], (err) => {
        if (err) {
          bot.sendMessage(chatId, 'Error updating your CV.');
          console.error(err);
          return;
        }
        bot.sendMessage(chatId, 'Your CV has been updated successfully.');
        delete userStates[chatId];
      });
    } else {
      bot.sendMessage(chatId, 'Invalid file type. Please upload a PDF document.');
    }
  }
});

function sendPortfolio(chatId) {
    db.query('SELECT * FROM portfolio WHERE chat_id = ?', [chatId], (err, results) => {
      if (err) {
        bot.sendMessage(chatId, 'Error accessing the database.');
        console.error(err);
        return;
      }

      if (results.length > 0) {
        const portfolio = results[0];
        const infoMessage = `
*Linked In:* ${portfolio.linkedin}
*Portfolio One:* ${portfolio.portfolio1}
*Portfolio Two:* ${portfolio.portfolio2}
*Description:* ${portfolio.description}
 
`;

const options = {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Edit LinkedIn', callback_data: 'linkedin_edit' }, { text: 'Edit Portfolio One', callback_data: 'portfolio1_edit' }],
      [{ text: 'Edit Portfolio Two', callback_data: 'portfolio2_edit' }, { text: 'Edit Description', callback_data: 'description_edit' }],
      [{ text: 'Close', callback_data: 'close' }]
    ]
  }
};


        bot.sendMessage(chatId, infoMessage, options);
      } else {
        bot.sendMessage(chatId, 'You are not registered. Please use /start to register.');
      }
    });
  
}
function sendProfile(chatId) {
  db.query('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Error accessing the database.');
      console.error(err);
      return;
    }

    if (results.length > 0) {
      const user = results[0];
      const infoMessage = `
*First Name:* ${user.first_name}
*Last Name:* ${user.last_name}
*Date of Birth:* ${user.dob}
*Gender:* ${user.gender}
*Residence Location:* ${user.residence}
*Phone Number:* ${user.phone}
*Email:* ${user.email}
*Education:* ${user.education}
`;
      const options = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Edit First Name', callback_data: 'edit_first_name' ,resize_keyboard: true}, { text: 'Edit Last Name', callback_data: 'edit_last_name' ,resize_keyboard: true}],
            [{ text: 'Edit Date of Birth', callback_data: 'edit_dob' ,resize_keyboard: true}, { text: 'Edit Gender', callback_data: 'edit_gender' ,resize_keyboard: true}],
            [{ text: 'Edit Residence Location', callback_data: 'edit_residence' ,resize_keyboard: true}, { text: 'Edit Phone Number', callback_data: 'edit_phone' ,resize_keyboard: true}],
            [{ text: 'Edit Email', callback_data: 'edit_email' ,resize_keyboard: true}, { text: 'Edit Education', callback_data: 'edit_education' ,resize_keyboard: true}],
            [{ text: 'Close', callback_data: 'close' }]
          ]
        }
      };

      bot.sendMessage(chatId, infoMessage, options);
    } else {
      bot.sendMessage(chatId, 'You are not registered. Please use /start to register.');
    }
  });
}

bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  if (data === 'close') {
    bot.deleteMessage(chatId, message.message_id);
    bot.sendMessage(chatId, 'Profile Closed.', defaultKeyBoard);

  } else if (data === 'change_cv') {
    bot.deleteMessage(chatId, message.message_id)
    .then(() => {
      bot.sendMessage(chatId, 'Please upload your new CV as a PDF document.');
      userStates[chatId] = { step: 'change_cv' };
    });
    
  }else if (data === 'edit_email') {
    bot.deleteMessage(chatId, message.message_id)
      .then(() => {
        bot.sendMessage(chatId, 'Please enter your new email:',cancelKeyBoard);
        userStates[chatId] = { step: 'edit_email' };
      });
  } else if (data === 'edit_first_name') {
        bot.deleteMessage(chatId, message.message_id)
      .then(() => {
    bot.sendMessage(chatId, 'Please enter your new first name:',cancelKeyBoard);
    userStates[chatId] = { step: 'edit_first_name' };
      });
  }else if (data === 'edit_last_name') {
        bot.deleteMessage(chatId, message.message_id)
      .then(() => {
    bot.sendMessage(chatId, 'Please enter your new last name:',cancelKeyBoard);
    userStates[chatId] = { step: 'edit_last_name' };
      });
  }else if (data === 'edit_dob') {
        bot.deleteMessage(chatId, message.message_id)
      .then(() => {
        bot.sendMessage(chatId, 'Please enter your new date of birth (YYYY/MM/DD):',cancelKeyBoard);
    userStates[chatId] = { step: 'edit_dob' };
      });
  }else if (data === 'edit_gender') {
        bot.deleteMessage(chatId, message.message_id)
      .then(() => {
   
bot.sendMessage(chatId, 'Please enter your new gender:', {
  reply_markup: {
    keyboard: [["Male", "Female"], ...cancelButton],
    resize_keyboard: true,
    one_time_keyboard: true
  }
});
    userStates[chatId] = { step: 'edit_gender' };
      });
  }else if (data === 'edit_residence') {
        bot.deleteMessage(chatId, message.message_id)
      .then(() => {
    bot.sendMessage(chatId, 'Please enter your new residence:',cancelKeyBoard);
    userStates[chatId] = { step: 'edit_residence' };
      });
  }else if (data === 'edit_phone') {
        bot.deleteMessage(chatId, message.message_id)
      .then(() => {
    bot.sendMessage(chatId, 'Please enter your new phone:',cancelKeyBoard);
    userStates[chatId] = { step: 'edit_phone' };
      });
  }else if (data === 'edit_education') {
        bot.deleteMessage(chatId, message.message_id)
      .then(() => {
    bot.sendMessage(chatId, 'Please enter your new education:',{
      reply_markup: {
        keyboard: [["Degree", "Masters", "PhD"], ["Diploma", "Certificate"],...cancelButton],
        one_time_keyboard: true
      }
    });
    userStates[chatId] = { step: 'edit_education' };
      });
  }else if (data === 'linkedin_edit') {
    bot.deleteMessage(chatId, message.message_id)
      .then(() => {
        bot.sendMessage(chatId, 'Please enter your new linkedin:',cancelKeyBoard);
        userStates[chatId] = { step: 'linkedin_edit' };
      });
  } 
  else if (data === 'portfolio1_edit') {
    bot.deleteMessage(chatId, message.message_id)
      .then(() => {
        bot.sendMessage(chatId, 'Please enter your new portfolio one:',cancelKeyBoard);
        userStates[chatId] = { step: 'portfolio1_edit' };
      });
  } else if (data === 'portfolio2_edit') {
    bot.deleteMessage(chatId, message.message_id)
      .then(() => {
        bot.sendMessage(chatId, 'Please enter your new portfolio two:',cancelKeyBoard);
        userStates[chatId] = { step: 'portfolio2_edit' };
      });
  } else if (data === 'description_edit') {
    bot.deleteMessage(chatId, message.message_id)
      .then(() => {
        bot.sendMessage(chatId, 'Please enter your new description:',cancelKeyBoard);
        userStates[chatId] = { step: 'description_edit' };
      });
  } 
});