import { useState, useEffect } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ManualSearchProps {
  onSearch: (state: string, lga: string) => void;
  isLoading: boolean;
}

export function ManualSearch({ onSearch, isLoading }: ManualSearchProps) {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedLga, setSelectedLga] = useState<string>('');
  const [lgas, setLgas] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/states')
      .then((res) => res.json())
      .then((data) => setStates(data.states || []))
      .catch(() => setStates([]));
  }, []);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedLga('');
    fetch(`/api/states?state=${encodeURIComponent(value)}`)
      .then((res) => res.json())
      .then((data) => setLgas(data.lgas || []))
      .catch(() => setLgas([]));
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
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
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
        <MagnifyingGlass className="h-5 w-5" aria-hidden="true" />
        Find Postal Code
      </Button>
    </div>
  );
}
