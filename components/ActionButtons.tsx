import { Button } from "@/components/ui/button";
import { Loader2, Download, Search, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

interface ActionButtonsProps {
  handleJobMatch: () => Promise<void>;
  handleCareerPlan: () => Promise<void>;
  handleDownloadPDF: () => Promise<void>;
  isLoadingJobs: boolean;
  isLoadingCareer: boolean;
  isGeneratingPDF: boolean;
}

export function ActionButtons({
  handleJobMatch,
  handleCareerPlan,
  handleDownloadPDF,
  isLoadingJobs,
  isLoadingCareer,
  isGeneratingPDF
}: ActionButtonsProps) {
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto mt-6">
      <motion.div 
        className="flex-1"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          onClick={handleJobMatch}
          variant="default"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
        >
          {isLoadingJobs ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Finding matches...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>AI Job Matcher</span>
            </div>
          )}
        </Button>
      </motion.div>

      <motion.div 
        className="flex-1"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          onClick={handleDownloadPDF}
          variant="default"
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-lg hover:shadow-purple-500/50 transition-all duration-200"
        >
          {isGeneratingPDF ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </div>
          )}
        </Button>
      </motion.div>

      <motion.div 
        className="flex-1"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          onClick={handleCareerPlan}
          variant="default"
          className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 shadow-lg hover:shadow-green-500/50 transition-all duration-200"
        >
          {isLoadingCareer ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing path...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Career Plan</span>
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
} 