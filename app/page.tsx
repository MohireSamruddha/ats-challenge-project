'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CVParser } from "@/services/CVParser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Search, Upload, Sparkles, Shield, FileText } from "lucide-react";
import { CVAgent } from "@/services/AgentService";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { downloadAsPDF } from "@/lib/utils";
import { motion } from "framer-motion";

interface ParsedResult {
  originalContent: string;
  anonymizedContent: string;
  formattedContent: string;
  enhancedContent: string;
  editedContent?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedCV, setParsedCV] = useState<ParsedResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<'original' | 'anonymized' | 'formatted' | 'enhanced'>('original');
  const [processingStatus, setProcessingStatus] = useState<
    'idle' | 'parsing' | 'anonymizing' | 'formatting' | 'enhancing' | 'complete'
  >('idle');
  const [editedCV, setEditedCV] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('original');
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState<string | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      console.log('File uploaded:', uploadedFile);
      setFile(uploadedFile);
      setParsedCV(null);
      setError(null);
    }
  };

  const handleProcessCV = async () => {
    if (!file) return;
    
    setShowDialog(true);
    setIsProcessing(true);
    setError(null);
    setProcessingStatus('parsing');

    try {
      // First parse the CV
      toast.info("Parsing CV file...");
      const parser = new CVParser();
      const initialParsed = await parser.parse(file);
      
      // Initialize the CV Agent
      const agent = new CVAgent();
      
      // Process the CV with agent steps
      setProcessingStatus('anonymizing');
      toast.info("Anonymizing CV...");
      const anonymizedContent = await agent.anonymizeLastNames(initialParsed.html);
      
      setProcessingStatus('formatting');
      toast.info("Reformatting CV structure...");
      const formattedContent = await agent.reformatCV(anonymizedContent);
      
      setProcessingStatus('enhancing');
      toast.info("Enhancing CV content...");
      const enhancedContent = await agent.enhanceCV(formattedContent);
      
      // Add CSS only once at the end
      const cssStyle = agent.getFormattingCSS();
      
      // Update the parsed result
      setParsedCV({
        originalContent: initialParsed.html,
        anonymizedContent,
        formattedContent: cssStyle + formattedContent,
        enhancedContent: cssStyle + enhancedContent
      });

      setProcessingStatus('complete');
      toast.success("CV processed successfully!");
    } catch (error) {
      console.error('Error processing CV:', error);
      setError('Failed to process the CV. Please try again.');
      toast.error("Failed to process CV");
      setProcessingStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJobMatch = async () => {
    if (!parsedCV?.enhancedContent) return;
    
    setIsLoadingJobs(true);
    setShowJobDialog(true);
    
    try {
      const agent = new CVAgent();
      const recommendations = await agent.getJobRecommendations(parsedCV.enhancedContent);
      setJobRecommendations(recommendations);
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      toast.error('Failed to get job recommendations');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  console.log('Current parsedCV state:', parsedCV);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
      {/* Hero Section */}
      <div className="relative isolate px-6">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <motion.h1 
              className="text-3xl font-bold tracking-tight sm:text-5xl mb-4 bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              AI-Powered CV Assistant
            </motion.h1>
            <motion.p 
              className="text-base leading-7 text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Transform your CV with AI-powered anonymization, professional reformatting, and intelligent enhancements.
            </motion.p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div 
                className="p-4 rounded-lg bg-card"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Shield className="w-8 h-8 mb-2 mx-auto text-primary" />
                <h3 className="text-base font-semibold mb-1">Privacy First</h3>
                <p className="text-xs text-muted-foreground">Secure anonymization of personal information</p>
              </motion.div>

              <motion.div 
                className="p-4 rounded-lg bg-card"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Sparkles className="w-8 h-8 mb-2 mx-auto text-primary" />
                <h3 className="text-base font-semibold mb-1">AI Enhancement</h3>
                <p className="text-xs text-muted-foreground">Smart content improvements and formatting</p>
              </motion.div>

              <motion.div 
                className="p-4 rounded-lg bg-card"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <FileText className="w-8 h-8 mb-2 mx-auto text-primary" />
                <h3 className="text-base font-semibold mb-1">Professional Format</h3>
                <p className="text-xs text-muted-foreground">Clean, ATS-friendly layout</p>
              </motion.div>
            </div>

            {/* Upload Section */}
            <motion.div 
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex flex-col items-center gap-3">
                <Button
                  variant="outline"
                  asChild
                  className="h-24 w-full border-dashed border-2 hover:border-primary hover:bg-muted/50"
                >
                  <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center justify-center gap-1">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="font-medium text-sm">{file ? file.name : 'Choose a file'}</span>
                    <span className="text-xs text-muted-foreground">
                      Drag & drop or click to upload
                    </span>
                  </label>
                </Button>
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOCX
                </p>
                {file && (
                  <Button 
                    onClick={handleProcessCV} 
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process CV"
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="dialog-container">
            <DialogHeader>
              <DialogTitle>CV Preview</DialogTitle>
            </DialogHeader>
            
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {processingStatus === 'parsing' && "Parsing CV..."}
                  {processingStatus === 'anonymizing' && "Anonymizing CV..."}
                  {processingStatus === 'formatting' && "Reformatting CV..."}
                  {processingStatus === 'enhancing' && "Enhancing CV..."}
                  {processingStatus === 'complete' && "Finalizing..."}
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : parsedCV ? (
              <Tabs defaultValue="original" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="anonymized">Anonymized</TabsTrigger>
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
                
                <TabsContent value="original">
                  <div className="dialog-tabs-content">
                    <div className="dialog-content-wrapper">
                      <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: parsedCV.originalContent }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="anonymized">
                  <div className="dialog-tabs-content">
                    <div className="dialog-content-wrapper">
                      <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: parsedCV.anonymizedContent }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="formatted">
                  <div className="dialog-tabs-content">
                    <div className="dialog-content-wrapper">
                      <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: parsedCV.formattedContent }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="enhanced">
                  <div className="dialog-tabs-content">
                    <div className="dialog-content-wrapper">
                      <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: parsedCV.enhancedContent }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="edit">
                  <div className="dialog-tabs-content">
                    <div className="dialog-content-wrapper">
                      <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                        <RichTextEditor
                          initialContent={editedCV || parsedCV.enhancedContent}
                          onChange={(html) => setEditedCV(html)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No CV data available</p>
              </div>
            )}

            {parsedCV && activeTab === 'enhanced' && (
              <div className="flex justify-end gap-2 mt-2 mb-4">
                <Button
                  onClick={handleJobMatch}
                  variant="default"
                  className="gap-2 bg-black hover:bg-black/90"
                >
                  {isLoadingJobs ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finding matches...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      AI Job Matcher
                    </>
                  )}
                </Button>
                <Button
                  onClick={async () => {
                    if (!parsedCV) return;
                    try {
                      setIsGeneratingPDF(true);
                      const content = editedCV || parsedCV.enhancedContent;
                      const firstNameMatch = content.match(/<h1 class="cv-name">(.*?)<\/h1>/);
                      const firstName = firstNameMatch ? firstNameMatch[1].trim() : 'CV';
                      
                      await toast.promise(
                        downloadAsPDF(content, firstName),
                        {
                          loading: 'Generating PDF...',
                          success: 'PDF downloaded successfully!',
                          error: 'Failed to generate PDF'
                        }
                      );
                    } catch (error) {
                      console.error('PDF generation error:', error);
                      toast.error('Failed to generate PDF');
                    } finally {
                      setIsGeneratingPDF(false);
                    }
                  }}
                  disabled={isGeneratingPDF}
                  className="gap-2 bg-black hover:bg-black/90"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              AI Job Recommendations
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingJobs ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">
                Analyzing CV and finding best matches...
              </p>
            </div>
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: jobRecommendations || '' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
