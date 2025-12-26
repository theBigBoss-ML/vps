import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { nigeriaStates, getLgasByState } from '@/data/nigeriaStates';

interface ManualSearchProps {
  onSearch: (state: string, lga: string) => void;
  isLoading: boolean;
}

export function ManualSearch({ onSearch, isLoading }: ManualSearchProps) {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedLga, setSelectedLga] = useState<string>('');
  const [lgas, setLgas] = useState<string[]>([]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedLga('');
    setLgas(getLgasByState(value));
  };

  const handleSearch = () => {
    if (selectedState && selectedLga) {
      onSearch(selectedState, selectedLga);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="state-select" className="text-sm font-medium">
            Select State
          </Label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger 
              id="state-select"
              className="w-full h-12"
              aria-label="Select your state"
            >
              <SelectValue placeholder="Choose your state" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {nigeriaStates.map((state) => (
                <SelectItem key={state.name} value={state.name}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lga-select" className="text-sm font-medium">
            Select LGA
          </Label>
          <Select 
            value={selectedLga} 
            onValueChange={setSelectedLga}
            disabled={!selectedState}
          >
            <SelectTrigger 
              id="lga-select"
              className="w-full h-12"
              aria-label="Select your Local Government Area"
            >
              <SelectValue placeholder={selectedState ? "Choose your LGA" : "Select state first"} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {lgas.map((lga) => (
                <SelectItem key={lga} value={lga}>
                  {lga}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleSearch}
        disabled={!selectedState || !selectedLga || isLoading}
        className="w-full h-12 gap-2 bg-nigeria-green hover:bg-nigeria-green/90"
        aria-label="Search for postal code"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
        Find Postal Code
      </Button>
    </div>
  );
}
