'use client';

import { FC } from 'react';
import { PdfIcon } from '@/icons/PdfIcon';
import { CheckIcon } from '@/icons/CheckIcon';

type ConvertedResultProps = {
  downloadUrl: string;
  onReset: () => void;
};

export const ConvertedResult: FC<ConvertedResultProps> = ({ downloadUrl, onReset }) => {
  return (
    <div className="flex flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-md text-center">
      <div className="relative">
        <div className="rounded-full bg-red-50 p-4">
          <div className="grid place-items-center rounded-full bg-red-100 p-4 [&>svg]:size-10 text-red-600">
            <PdfIcon />
          </div>
        </div>

        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
          <div className="bg-green-500 rounded-full p-1 text-white">
            <CheckIcon />
          </div>
        </div>
      </div>

      <p className="text-black-700 font-semibold text-lg">File converted successfully!</p>

      
      <div className="flex flex-col sm:flex-row w-full gap-3">
        <button title='Convert Another Presentation'
          type="button"
          onClick={onReset}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Convert another
        </button>

        <button
        type="button" title='Download Converted PDF'
        onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}
        className="w-full rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm text-center hover:bg-blue-700"
        >
          Download File
        </button>
      </div>
    </div>
  );
};