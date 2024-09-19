const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const upload = multer();

app.post('/api/postToFacebook', upload.array('images', 5), async (req, res) => {
  const { message } = req.body;
  const images = req.files; // Images uploaded by user
  const pageAccessToken = 'EAAF1pWMJ19YBO7axqg9PfQSFC69kSZA8eHHaFXBen4q4pibZB1DHEBi6pNYspCuZAVON1ZBv3joFXgwBTOwBsIl9ScDk9kHE4Coty3IpN7vFZCD6RQlMN0GmkqDcos2dFQY8YWEJZAt386BZCxY4bwvnkXvdDmg8z8j8CpwwlCQJ1t2a4vMA5XKx1sN1g5vu6AZD';
  const pageId = '107493672373057';

  const telegramBotToken = 'your-telegram-bot-token';
  const telegramChatId = '@your_channel_id'; // Update with your actual channel ID

  try {
    // Post images to Facebook
    const uploadedImages = await Promise.all(images.map(async (image) => {
      const formData = new FormData();
      formData.append('source', image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
      formData.append('published', 'false'); // Do not publish yet
      formData.append('access_token', pageAccessToken);

      const response = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/photos`, formData, {
        headers: formData.getHeaders()
      });

      return response.data.id; // Facebook image ID (media_fbid)
    }));

    // Post message with images to Facebook
    const mediaAttachments = uploadedImages.map((id) => ({ media_fbid: id }));
    const postResponse = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/feed`, {
      message,
      attached_media: mediaAttachments,
      access_token: pageAccessToken
    });

    // Send the message to Telegram first
    await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      chat_id: telegramChatId,
      text: message
    });

    // Prepare media for Telegram
    const telegramMedia = images.map((image, index) => ({
      type: 'photo',
      media: `attach://${image.originalname}`, // Attach file reference
    }));

    // Create FormData for Telegram request
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', telegramChatId);
    telegramFormData.append('media', JSON.stringify(telegramMedia));

    // Attach each file
    images.forEach((image) => {
      telegramFormData.append(image.originalname, image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
    });

    // Send the media group to Telegram
    const telegramResponse = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData, {
      headers: telegramFormData.getHeaders(),
    });

    // Response handling
    res.status(200).json({ 
      facebookPostId: postResponse.data.id, 
      telegramResult: telegramResponse.data 
    });
    
  } catch (error) {
    console.error('Error posting to Facebook or Telegram:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to post message', details: error.response ? error.response.data : error.message });
  }
});


const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const upload = multer();

app.post('/api/postToFacebook', upload.array('images', 5), async (req, res) => {
  const { message } = req.body;
  const images = req.files; // Images uploaded by user
  const pageAccessToken = 'EAAF1pWMJ19YBO7axqg9PfQSFC69kSZA8eHHaFXBen4q4pibZB1DHEBi6pNYspCuZAVON1ZBv3joFXgwBTOwBsIl9ScDk9kHE4Coty3IpN7vFZCD6RQlMN0GmkqDcos2dFQY8YWEJZAt386BZCxY4bwvnkXvdDmg8z8j8CpwwlCQJ1t2a4vMA5XKx1sN1g5vu6AZD';
  const pageId = '107493672373057';

  const telegramBotToken = 'your-telegram-bot-token';
  const telegramChatId = '@your_channel_id'; // Update with your actual channel ID

  try {
    // Post images to Facebook
    const uploadedImages = await Promise.all(images.map(async (image) => {
      const formData = new FormData();
      formData.append('source', image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
      formData.append('published', 'false'); // Do not publish yet
      formData.append('access_token', pageAccessToken);

      const response = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/photos`, formData, {
        headers: formData.getHeaders()
      });

      return response.data.id; // Facebook image ID (media_fbid)
    }));

    // Post message with images to Facebook
    const mediaAttachments = uploadedImages.map((id) => ({ media_fbid: id }));
    const postResponse = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/feed`, {
      message,
      attached_media: mediaAttachments,
      access_token: pageAccessToken
    });

    // Prepare media for Telegram
    const telegramMedia = images.map((image, index) => ({
      type: 'photo',
      media: `attach://${image.originalname}`, // Attach file reference
    }));

    // Create FormData for Telegram request
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', telegramChatId);
    telegramFormData.append('media', JSON.stringify(telegramMedia));

    // Attach each file
    images.forEach((image) => {
      telegramFormData.append(image.originalname, image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
    });

    // Send the media group to Telegram
    const telegramResponse = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData, {
      headers: telegramFormData.getHeaders(),
    });

    // Response handling
    res.status(200).json({ 
      facebookPostId: postResponse.data.id, 
      telegramResult: telegramResponse.data 
    });
    
  } catch (error) {
    console.error('Error posting to Facebook or Telegram:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to post message', details: error.response ? error.response.data : error.message });
  }
});
