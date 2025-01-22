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

interface ParsedResult {
  content: string;
  firstName: string | null;
  html: string;
  originalHtml?: string;
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
      const parser = new CVParser();
      const result = await parser.parse(file);
      setParsedCV(result);
    } catch (error) {
      console.error('Error processing CV:', error);
      setError('Failed to process the CV. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
                {isProcessing ? "Processing..." : "Process CV"}
              </Button>
            </>
          )}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center w-full">
              {isProcessing ? "Processing CV" : error ? "Error" : "CV Preview"}
            </DialogTitle>
          </DialogHeader>

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Processing your CV...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-destructive">{error}</p>
              <Button 
                onClick={() => setShowDialog(false)} 
                variant="outline" 
                className="mt-4"
              >
                Close
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Original CV</TabsTrigger>
                <TabsTrigger value="processed">Processed CV</TabsTrigger>
              </TabsList>
              
              <TabsContent value="original" className="mt-4">
                <div className="border rounded-lg p-4 min-h-[400px] flex items-center justify-center bg-muted/10">
                  <p className="text-muted-foreground">
                    Original CV content will appear here
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="processed" className="mt-4">
                <div className="border rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Processed and anonymized CV will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
