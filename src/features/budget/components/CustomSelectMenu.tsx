// Delete all the file

"use client";

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  colorClass: string; // Para el color de fondo de la opción
}

interface CustomSelectMenuProps {
  options: Option[];
  value: string; // El valor actualmente seleccionado
  onChange: (value: string) => void;
  placeholder: string;
}

export default function CustomSelectMenu({ options, value, onChange, placeholder }: CustomSelectMenuProps) {
  const selectedOption = options.find(option => option.value === value);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200">
          {selectedOption ? (
            <div className='flex items-center gap-2'>
              <span className={`w-3 h-3 rounded-full ${selectedOption.colorClass}`}></span>
              {selectedOption.label}
            </div>
          ) : placeholder}
          <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onChange(option.value)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                  >
                    <span className={`w-3 h-3 rounded-full mr-3 ${option.colorClass}`}></span>
                    {option.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}