
'use client';
import { useState } from "react";
import { ChooseFileStep } from "@/components/ChooseFileStep";
import { HandleFile } from "@/components/FileDragged/HandleFile";
import { ConvertedResult } from "@/components/FileConversion/ConvertedResult";


const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleCancel = () => {
    setFile(null);
    setDownloadUrl(null);
  };
  
  const handleConverted = (url: string) => {
    setDownloadUrl(url);
  };

  return (
  <main className="w-full max-w-[420px]">
    
    {!file && !downloadUrl && (
          <ChooseFileStep onFileSelected={(file) => setFile(file)} />
    )}    

    {file && !downloadUrl && (
              <HandleFile
                file={file}
                onCancel={handleCancel}
                onConverted={handleConverted}
              />
    )}
    
    {downloadUrl && (
          <ConvertedResult
            downloadUrl={downloadUrl}
            onReset={handleCancel}
          />
        )}
  </main>
  );
};

export default Home;
