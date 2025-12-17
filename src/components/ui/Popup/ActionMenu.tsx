"use client";

import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface MenuItem {
    label: string;
    icon: React.ElementType;
    onClick: (e?: React.MouseEvent) => void;
    className?: string;
}

interface ActionMenuProps {
    items: MenuItem[];
}

export default function ActionMenu({ items }: ActionMenuProps) {
    const [position, setPosition] = useState<{ 
        top: number; 
        left: number; 
        openUpwards: boolean; 
    } | undefined>(undefined);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const calculatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuWidth = 224; // w-56 = 224px
            const menuHeight = items.length * 40 + 16; // altura aproximada del menú
            const spacing = 4; // espacio entre el botón y el menú

            // Calcular posición horizontal (igual que antes)
            let left = rect.right + window.scrollX - menuWidth;
            
            // Ajustar si se sale por la izquierda
            if (left < spacing) {
                left = rect.left + window.scrollX;
            }

            // 🔥 DETECCIÓN INTELIGENTE: ¿Hay espacio abajo?
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const openUpwards = spaceBelow < menuHeight && spaceAbove > spaceBelow;

            // Calcular posición vertical
            let top;
            if (openUpwards) {
                // Abrir hacia ARRIBA
                top = rect.top + window.scrollY - menuHeight - spacing;
            } else {
                // Abrir hacia ABAJO (comportamiento normal)
                top = rect.bottom + window.scrollY + spacing;
            }

            setPosition({
                top,
                left,
                openUpwards
            });
        }
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button
                    ref={buttonRef}
                    className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        calculatePosition();
                    }}
                >
                    <MoreVertical size={16} />
                </Menu.Button>
            </div>

            {ReactDOM.createPortal(
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items
                        className={`
                            fixed w-56 divide-y divide-gray-100 rounded-md bg-white 
                            shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50
                            ${position?.openUpwards ? 'origin-bottom-right' : 'origin-top-right'}
                        `}
                        style={{ 
                            top: position?.top, 
                            left: position?.left 
                        }}
                    >
                        <div className="px-1 py-1">
                            {items.map((item) => (
                                <Menu.Item key={item.label}>
                                    {({ active }) => (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                item.onClick();
                                            }}
                                            className={`${
                                                active ? 'bg-gray-100' : ''
                                            } group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 ${
                                                item.className || ''
                                            }`}
                                        >
                                            <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
                                            {item.label}
                                        </button>
                                    )}
                                </Menu.Item>
                            ))}
                        </div>
                    </Menu.Items>
                </Transition>,
                document.body
            )}
        </Menu>
    );
}