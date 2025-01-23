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
import { Loader2, Download, Search } from "lucide-react";
import { CVAgent } from "@/services/AgentService";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { downloadAsPDF } from "@/lib/utils";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8">
        <h2 className="text-3xl font-bold">Upload CV</h2>
        
        <div className="flex flex-col items-center gap-4">
          <Button
            variant="outline"
            asChild
            className="h-12 px-8"
          >
            <label htmlFor="cv-upload" className="cursor-pointer">
              {file ? file.name : 'Choose a file'}
            </label>
          </Button>
          <input
            id="cv-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, DOCX
          </p>
          {file && (
            <>
              <p className="text-sm text-green-600">
                File uploaded successfully! You can now proceed with processing.
              </p>
              <Button 
                onClick={handleProcessCV} 
                disabled={isProcessing}
                className="mt-2"
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
            </>
          )}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
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
                <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: parsedCV.originalContent }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="anonymized">
                <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: parsedCV.anonymizedContent }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="formatted">
                <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: parsedCV.formattedContent }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="enhanced">
                <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: parsedCV.enhancedContent }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="edit">
                <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                  <RichTextEditor
                    initialContent={editedCV || parsedCV.enhancedContent}
                    onChange={(html) => setEditedCV(html)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No CV data available</p>
            </div>
          )}

          {parsedCV && activeTab === 'enhanced' && (
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={handleJobMatch}
                variant="secondary"
                className="gap-2"
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
                  if (isGeneratingPDF) return;
                  
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
                className="gap-2"
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
