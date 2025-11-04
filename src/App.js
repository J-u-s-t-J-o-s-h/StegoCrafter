import React, { useState } from 'react';
import { Upload, Download, Eye, EyeOff, Lock, Unlock, Image, FileText } from 'lucide-react';
import { encodeMessage, decodeMessage, downloadBlob } from './utils/steganographyUtils';
import { track } from '@plausible-analytics/tracker';

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
      
      // Track encode event
      track('Encode', { props: { hasPassword: password ? 'yes' : 'no' } });
      
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
      
      // Track decode event
      track('Decode', { props: { hasPassword: password ? 'yes' : 'no' } });
      
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
      
      // Track download event
      track('Download', { props: { fileType: 'encoded_image' } });
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
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight animate-pulse" style={{animationDuration: '3s'}}>
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              StegoCrafter
            </span>
          </h1>
          <p className="text-green-300 text-lg">Hide secret messages in images</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 flex border border-green-500/30">
            <button
              onClick={() => { setMode('encode'); resetForm(); }}
              className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                mode === 'encode'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                  : 'text-gray-300 hover:text-green-300'
              }`}
            >
              <Lock size={20} />
              Encode
            </button>
            <button
              onClick={() => { setMode('decode'); resetForm(); }}
              className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                mode === 'decode'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                  : 'text-gray-300 hover:text-green-300'
              }`}
            >
              <Unlock size={20} />
              Decode
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-green-500/30 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse" style={{animationDuration: '4s'}}></div>
            <div className="relative z-10">
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-green-300 text-sm font-semibold mb-3">
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
                        className="w-full h-64 object-cover rounded-lg border border-green-500/30"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <p className="text-green-300 font-semibold">Click to change image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-green-500/50 rounded-lg p-12 text-center hover:border-green-400 transition-colors hover:shadow-lg hover:shadow-green-500/20">
                      <Upload className="mx-auto mb-4 text-green-400 animate-bounce" size={48} />
                      <p className="text-green-300 font-medium">Click to upload image</p>
                      <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Message Input (Encode Mode) */}
            {mode === 'encode' && (
              <div className="mb-6">
                <label className="block text-green-300 text-sm font-semibold mb-3">
                  <FileText className="inline mr-2" size={16} />
                  Secret Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your secret message..."
                  className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:shadow-lg focus:shadow-green-500/20 transition-all resize-none"
                  rows="4"
                />
                <p className="text-gray-400 text-sm mt-2">
                  {message.length} characters
                </p>
              </div>
            )}

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-green-300 text-sm font-semibold mb-3">
                <Lock className="inline mr-2" size={16} />
                Password (Optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password for encryption..."
                  className="w-full px-4 py-3 pr-12 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:shadow-lg focus:shadow-green-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
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
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              {isProcessing ? (
                <span className="flex items-center justify-center relative">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center relative">
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
                className="w-full mt-4 py-4 bg-gray-900/80 text-green-300 font-bold rounded-lg hover:bg-gray-800 border border-green-500/30 hover:border-green-400 transition-all flex items-center justify-center hover:shadow-lg hover:shadow-green-500/20">
                <Download className="mr-2" size={20} />
                Download Encoded Image
              </button>
            )}
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/20 hover:border-green-400 transition-all hover:shadow-lg hover:shadow-green-500/20">
              <Image className="text-green-400 mb-2 animate-pulse" size={24} style={{animationDuration: '3s'}} />
              <h3 className="text-white font-semibold mb-1">Invisible</h3>
              <p className="text-gray-400 text-sm">Messages are hidden in pixel data</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/20 hover:border-green-400 transition-all hover:shadow-lg hover:shadow-green-500/20">
              <Lock className="text-green-400 mb-2 animate-pulse" size={24} style={{animationDuration: '3s', animationDelay: '1s'}} />
              <h3 className="text-white font-semibold mb-1">Secure</h3>
              <p className="text-gray-400 text-sm">Optional password encryption</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/20 hover:border-green-400 transition-all hover:shadow-lg hover:shadow-green-500/20">
              <FileText className="text-green-400 mb-2 animate-pulse" size={24} style={{animationDuration: '3s', animationDelay: '2s'}} />
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