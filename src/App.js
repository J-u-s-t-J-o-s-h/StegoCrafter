import React, { useState } from 'react';
import { Upload, Download, Eye, EyeOff, Lock, Unlock, Image, FileText } from 'lucide-react';
import { encodeMessage, decodeMessage, downloadBlob } from './utils/steganographyUtils';

function App() {
  const [mode, setMode] = useState('encode');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [encodedImageBlob, setEncodedImageBlob] = useState(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError('');
      setDecodedMessage('');
      setEncodedImageBlob(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEncode = async () => {
    if (!selectedImage || !message) {
      setError('Please select an image and enter a message');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      const blob = await encodeMessage(selectedImage, message, password);
      setEncodedImageBlob(blob);
      
      // Create preview of encoded image
      const url = URL.createObjectURL(blob);
      setImagePreview(url);
      
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to encode message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecode = async () => {
    if (!selectedImage) {
      setError('Please select an image to decode');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setDecodedMessage('');
    
    try {
      const decoded = await decodeMessage(selectedImage, password);
      setDecodedMessage(decoded);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to decode message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (encodedImageBlob) {
      const filename = `encoded_${Date.now()}.png`;
      downloadBlob(encodedImageBlob, filename);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setMessage('');
    setDecodedMessage('');
    setPassword('');
    setEncodedImageBlob(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Steganography Tool
          </h1>
          <p className="text-purple-200 text-lg">Hide secret messages in images</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 flex">
            <button
              onClick={() => { setMode('encode'); resetForm(); }}
              className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                mode === 'encode'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Lock size={20} />
              Encode
            </button>
            <button
              onClick={() => { setMode('decode'); resetForm(); }}
              className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                mode === 'decode'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Unlock size={20} />
              Decode
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-purple-500/20">
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-purple-200 text-sm font-semibold mb-3">
                Select Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block"
                >
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Selected"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <p className="text-white font-semibold">Click to change image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-12 text-center hover:border-purple-400 transition-colors">
                      <Upload className="mx-auto mb-4 text-purple-400" size={48} />
                      <p className="text-purple-200 font-medium">Click to upload image</p>
                      <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Message Input (Encode Mode) */}
            {mode === 'encode' && (
              <div className="mb-6">
                <label className="block text-purple-200 text-sm font-semibold mb-3">
                  <FileText className="inline mr-2" size={16} />
                  Secret Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your secret message..."
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                  rows="4"
                />
                <p className="text-gray-400 text-sm mt-2">
                  {message.length} characters
                </p>
              </div>
            )}

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-purple-200 text-sm font-semibold mb-3">
                <Lock className="inline mr-2" size={16} />
                Password (Optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password for encryption..."
                  className="w-full px-4 py-3 pr-12 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Decoded Message Display (Decode Mode) */}
            {mode === 'decode' && decodedMessage && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
                <h3 className="text-green-400 font-semibold mb-2">Decoded Message:</h3>
                <p className="text-white">{decodedMessage}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={mode === 'encode' ? handleEncode : handleDecode}
              disabled={isProcessing || !selectedImage || (mode === 'encode' && !message)}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {mode === 'encode' ? (
                    <>
                      <Lock className="mr-2" size={20} />
                      Encode Message
                    </>
                  ) : (
                    <>
                      <Unlock className="mr-2" size={20} />
                      Decode Message
                    </>
                  )}
                </span>
              )}
            </button>

            {/* Download Button (after encoding) */}
            {mode === 'encode' && encodedImageBlob && (
              <button 
                onClick={handleDownload}
                className="w-full mt-4 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center">
                <Download className="mr-2" size={20} />
                Download Encoded Image
              </button>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/10">
              <Image className="text-purple-400 mb-2" size={24} />
              <h3 className="text-white font-semibold mb-1">Invisible</h3>
              <p className="text-gray-400 text-sm">Messages are hidden in pixel data</p>
            </div>
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/10">
              <Lock className="text-purple-400 mb-2" size={24} />
              <h3 className="text-white font-semibold mb-1">Secure</h3>
              <p className="text-gray-400 text-sm">Optional password encryption</p>
            </div>
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/10">
              <FileText className="text-purple-400 mb-2" size={24} />
              <h3 className="text-white font-semibold mb-1">Lossless</h3>
              <p className="text-gray-400 text-sm">Original image quality preserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;