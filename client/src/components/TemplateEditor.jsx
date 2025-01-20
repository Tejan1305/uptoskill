import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Save, Sparkles, Download } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const TemplateEditor = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiConverted, setAiConverted] = useState(false);
  const [popupMessage, setPopupMessage] = useState(''); // State for popup message

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/templates`, formData);
      setTemplates([response.data, ...templates]);
      setSelectedTemplate(response.data);
      setContent(response.data.content);
      setAiConverted(false);
      setPopupMessage('Template uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      setPopupMessage('Error uploading template!');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate || !content) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/templates/${selectedTemplate._id}`,
        { content }
      );
      setSelectedTemplate(response.data);
      setAiConverted(false);
      await fetchTemplates();
      setPopupMessage('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      setPopupMessage('Error saving template!');
    }
    setLoading(false);
  };

  const handleAiConvert = async () => {
    if (!content) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/convert`, { content });
      setContent(response.data.convertedContent);
      setAiConverted(true);
      setPopupMessage('Template converted using AI!');
    } catch (error) {
      console.error('Error converting template using AI:', error);
      setPopupMessage('Error converting template with AI!');
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'application/latex' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'converted_template.tex';
    link.click();
  };

  return (
    <div className="container mx-auto p-4">
      {/* Popup message */}
      {popupMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
          {popupMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI-Enhanced LaTeX Editor</h1>
        <div className="flex space-x-4">
          <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2">
            <Upload size={20} />
            <span>Upload Template</span>
            <input
              type="file"
              accept=".tex"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          {selectedTemplate && (
            <>
              <button 
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded flex items-center space-x-2"
                disabled={loading}
              >
                <Save size={20} />
                <span>Save Changes</span>
              </button>
              {!aiConverted && (
                <button
                  onClick={handleAiConvert}
                  className="bg-purple-500 text-white px-4 py-2 rounded flex items-center space-x-2"
                  disabled={loading}
                >
                  <Sparkles size={20} />
                  <span>Convert Using AI</span>
                </button>
              )}
              {aiConverted && (
                <button
                  onClick={handleDownload}
                  className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2"
                >
                  <Download size={20} />
                  <span>Download Converted Template</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Template List */}
        <div className="col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Templates</h2>
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template._id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setContent(template.content);
                  setAiConverted(false);
                }}
                className={`p-3 rounded cursor-pointer ${
                  selectedTemplate?._id === template._id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="text-sm text-gray-500">
                  {/* Last updated: {new Date(template.updatedAt).toLocaleDateString()} */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="col-span-2">
          {selectedTemplate ? (
            <div className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border rounded lg:w-[95%] xl:w-[90%]"
                placeholder="Edit your LaTeX content here..."
              />

              {!aiConverted && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-2 mb-4">
                    {/* <Sparkles size={20} className="text-purple-500" /> */}
                    {/* <h3 className="text-lg font-semibold">AI Suggestions</h3> */}
                  </div>
                  {/* AI suggestions content (removed for AI-conversion) */}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-gray-500">
                Select a template or upload a new one to begin editing
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
