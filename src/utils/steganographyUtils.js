// steganographyUtils.js - Place this in src/utils/

/**
 * Converts a string message to binary representation
 */
function messageToBinary(message) {
  return message.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}

/**
 * Converts binary string back to text message
 */
function binaryToMessage(binary) {
  const chars = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    if (byte.length === 8) {
      chars.push(String.fromCharCode(parseInt(byte, 2)));
    }
  }
  return chars.join('');
}

/**
 * Simple XOR encryption/decryption with password
 */
function xorEncrypt(message, password) {
  if (!password) return message;
  
  let result = '';
  for (let i = 0; i < message.length; i++) {
    result += String.fromCharCode(
      message.charCodeAt(i) ^ password.charCodeAt(i % password.length)
    );
  }
  return result;
}

/**
 * Encodes a message into an image using LSB steganography
 */
export async function encodeMessage(imageFile, message, password = '') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const img = new Image();
      
      img.onload = function() {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Encrypt message if password provided
        const encryptedMessage = xorEncrypt(message, password);
        
        // Add delimiter to mark end of message
        const delimiter = '\u0000\u0000\u0000';
        const fullMessage = encryptedMessage + delimiter;
        const binaryMessage = messageToBinary(fullMessage);
        
        // Check if image is large enough
        const maxBits = (data.length / 4) * 3; // 3 color channels per pixel
        if (binaryMessage.length > maxBits) {
          reject(new Error('Message too long for this image'));
          return;
        }
        
        // Encode message into image
        let messageIndex = 0;
        for (let i = 0; i < data.length && messageIndex < binaryMessage.length; i += 4) {
          // Modify RGB channels (skip alpha)
          for (let j = 0; j < 3 && messageIndex < binaryMessage.length; j++) {
            // Replace LSB with message bit
            data[i + j] = (data[i + j] & 0xFE) | parseInt(binaryMessage[messageIndex]);
            messageIndex++;
          }
        }
        
        // Put modified data back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to blob
        canvas.toBlob(function(blob) {
          resolve(blob);
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Decodes a message from an image using LSB steganography
 */
export async function decodeMessage(imageFile, password = '') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const img = new Image();
      
      img.onload = function() {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Extract binary message from LSBs
        let binaryMessage = '';
        for (let i = 0; i < data.length; i += 4) {
          // Extract from RGB channels (skip alpha)
          for (let j = 0; j < 3; j++) {
            binaryMessage += (data[i + j] & 1).toString();
          }
        }
        
        // Convert binary to text
        const extractedMessage = binaryToMessage(binaryMessage);
        
        // Find delimiter
        const delimiterIndex = extractedMessage.indexOf('\u0000\u0000\u0000');
        if (delimiterIndex === -1) {
          resolve('No hidden message found');
          return;
        }
        
        // Extract actual message
        const encryptedMessage = extractedMessage.substring(0, delimiterIndex);
        
        // Decrypt if password provided
        const decryptedMessage = xorEncrypt(encryptedMessage, password);
        
        resolve(decryptedMessage);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}