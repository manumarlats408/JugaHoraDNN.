"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from 'lucide-react'

export function SimpleDatePicker({ 
  value, 
  onChange, 
  onClear 
}: { 
  value: string, 
  onChange: (value: string) => void,
  onClear: () => void
}) {
  const [displayValue, setDisplayValue] = useState("");
  
  // Actualizar el valor mostrado cuando cambia el valor de entrada
  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        setDisplayValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
      } else {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    
    // Validar formato dd/mm/yyyy
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (regex.test(newValue)) {
      const parts = newValue.split("/");
      const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      onChange(formattedDate);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-full">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="dd/mm/yyyy"
          value={displayValue}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>
      <Button
        variant="outline"
        onClick={onClear}
        className="px-2"
      >
        Borrar
      </Button>
    </div>
  );
}