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
import { Loader2 } from "lucide-react";
import { CVAgent } from "@/services/AgentService";
import { toast } from "sonner";

interface ParsedResult {
  content: string;
  firstName: string | null;
  html: string;
  originalHtml: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedCV, setParsedCV] = useState<ParsedResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      // First parse the CV
      const parser = new CVParser();
      const initialParsed = await parser.parse(file);
      
      // Initialize the CV Agent
      const agent = new CVAgent();
      
      // Process the CV with agent steps
      const processedResult = await agent.processCVWithSteps(initialParsed.html);
      
      // Update the parsed result with anonymized content
      setParsedCV({
        ...initialParsed,
        content: processedResult.anonymizedContent,
        html: processedResult.anonymizedContent,
        firstName: initialParsed.firstName
      });

      toast.success("CV processed successfully!");
    } catch (error) {
      console.error('Error processing CV:', error);
      setError('Failed to process the CV. Please try again.');
      toast.error("Failed to process CV");
    } finally {
      setIsProcessing(false);
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
              <p className="mt-4 text-sm text-muted-foreground">Processing your CV...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : parsedCV ? (
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Original CV</TabsTrigger>
                <TabsTrigger value="processed">Processed CV</TabsTrigger>
              </TabsList>
              
              <TabsContent value="original">
                <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: parsedCV.originalHtml }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="processed">
                <div className="border rounded-lg p-4 overflow-y-auto max-h-[60vh]">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: parsedCV.html }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No CV data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
