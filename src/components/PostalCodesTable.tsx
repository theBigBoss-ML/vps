import { useState } from 'react';
import { PostalCode } from '@/data/postalCodes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PostalCodesTableProps {
  postalCodes: PostalCode[];
  onUpdate: (postalCodes: PostalCode[]) => void;
}

export function PostalCodesTable({ postalCodes, onUpdate }: PostalCodesTableProps) {
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPostalCode, setNewPostalCode] = useState<Partial<PostalCode>>({
    state: 'Lagos',
  });

  const filteredPostalCodes = postalCodes.filter(pc =>
    pc.postalCode.includes(search) ||
    pc.area.toLowerCase().includes(search.toLowerCase()) ||
    pc.lga.toLowerCase().includes(search.toLowerCase()) ||
    pc.locality.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newPostalCode.postalCode || !newPostalCode.lga || !newPostalCode.area) return;
    
    const pc: PostalCode = {
      id: `custom-${Date.now()}`,
      postalCode: newPostalCode.postalCode,
      state: newPostalCode.state || 'Lagos',
      lga: newPostalCode.lga,
      area: newPostalCode.area,
      locality: newPostalCode.locality || '',
      street: newPostalCode.street,
    };

    onUpdate([...postalCodes, pc]);
    setNewPostalCode({ state: 'Lagos' });
    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    onUpdate(postalCodes.filter(pc => pc.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search postal codes, areas, LGAs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Postal Code
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="max-h-[400px] overflow-auto scrollbar-thin">
          <table className="data-table">
            <thead className="sticky top-0">
              <tr>
                <th>Postal Code</th>
                <th>State</th>
                <th>LGA</th>
                <th>Area</th>
                <th>Locality</th>
                <th>Street</th>
                <th className="w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPostalCodes.map((pc) => (
                <tr key={pc.id}>
                  <td className="font-mono font-medium text-primary">{pc.postalCode}</td>
                  <td className="text-sm">{pc.state}</td>
                  <td className="text-sm">{pc.lga}</td>
                  <td className="text-sm font-medium">{pc.area}</td>
                  <td className="text-sm text-muted-foreground">{pc.locality}</td>
                  <td className="text-sm text-muted-foreground">{pc.street || '--'}</td>
                  <td>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(pc.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredPostalCodes.length} of {postalCodes.length} postal codes
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Add New Postal Code
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Postal Code *</label>
                <Input
                  placeholder="e.g., 101241"
                  value={newPostalCode.postalCode || ''}
                  onChange={(e) => setNewPostalCode({ ...newPostalCode, postalCode: e.target.value })}
                  className="bg-muted/50 font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">State</label>
                <Input
                  placeholder="Lagos"
                  value={newPostalCode.state || ''}
                  onChange={(e) => setNewPostalCode({ ...newPostalCode, state: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">LGA *</label>
                <Input
                  placeholder="e.g., Eti-Osa"
                  value={newPostalCode.lga || ''}
                  onChange={(e) => setNewPostalCode({ ...newPostalCode, lga: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Area *</label>
                <Input
                  placeholder="e.g., Victoria Island"
                  value={newPostalCode.area || ''}
                  onChange={(e) => setNewPostalCode({ ...newPostalCode, area: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Locality</label>
                <Input
                  placeholder="e.g., Ahmadu Bello Way"
                  value={newPostalCode.locality || ''}
                  onChange={(e) => setNewPostalCode({ ...newPostalCode, locality: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Street (Optional)</label>
                <Input
                  placeholder="e.g., Adeola Odeku Street"
                  value={newPostalCode.street || ''}
                  onChange={(e) => setNewPostalCode({ ...newPostalCode, street: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsAddDialogOpen(false);
              setNewPostalCode({ state: 'Lagos' });
            }}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>
              Add Postal Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
