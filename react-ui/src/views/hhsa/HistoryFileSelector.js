import { Listbox } from '@headlessui/react';
import { Fragment, useImperativeHandle, forwardRef, useState } from 'react';
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { format } from 'date-fns';

const HistoryFileSelector = forwardRef(({ historyFiles, onSelect, onDelete }, ref) => {
  const [selected, setSelected] = useState(null);

  // 父層可調用 reset()
  useImperativeHandle(ref, () => ({
    reset: () => setSelected(null)
  }));

  const handleSelect = (file) => {
    console.log('handleSelect', file)
    setSelected(file);
    if (file === null) {
        onSelect(null); // 明確傳 null
      } else {
        onSelect(file.stored_name); // 正常傳 filename
      }
  };

  return (
    <div className="w-full">
      <Listbox value={selected} onChange={handleSelect}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded border border-gray-300 bg-white hover:border-blue-400 py-2 pl-3 pr-10 text-left shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs">
            {selected ? selected.original_name : '-- Select a uploaded file --'}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
              <ChevronUpDownIcon className="h-4 w-4" />
            </span>
          </Listbox.Button>

          <Listbox.Options as="ul" className="absolute z-20 mt-1 w-full max-h-36 overflow-y-auto rounded-md bg-white border border-gray-200 py-1 text-xs shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* Clear selection */}
            <Listbox.Option key="__clear__" value={null} as={Fragment}>
              {({ active }) => (
                <li
                  className={`px-3 py-2 text-gray-500 cursor-pointer ${
                    active ? 'bg-blue-50' : ''
                  }`}
                >
                  -- Select a uploaded file --
                </li>
              )}
            </Listbox.Option>

            {/* File options */}
            {historyFiles.length === 0 ? (
              <div className="text-gray-400 text-center px-4 py-2 italic">
                No files available
              </div>
            ) : (
              historyFiles.map((file) => (
                <Listbox.Option key={file.stored_name} value={file} as={Fragment}>
                  {({ active, selected }) => (
                    <li
                      className={`flex justify-between items-center px-3 py-2 cursor-pointer ${
                        active ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span
                        className={`${selected ? 'font-semibold' : 'font-normal'} truncate`}
                      >
                        {file.original_name} ({format(new Date(file.timestamp * 1000), 'HH:mm dd MMM')})
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(file.stored_name);
                        }}
                        className="ml-2 text-red-400 hover:text-red-600 text-xs"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </li>
                  )}
                </Listbox.Option>
              ))
            )}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
});

export default HistoryFileSelector;
