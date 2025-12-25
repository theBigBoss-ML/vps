import { useState } from 'react';
import { TestCoordinate } from '@/data/testCoordinates';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2, Edit2, MapPin, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CoordinatesTableProps {
  coordinates: TestCoordinate[];
  onUpdate: (coordinates: TestCoordinate[]) => void;
}

export function CoordinatesTable({ coordinates, onUpdate }: CoordinatesTableProps) {
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCoordinate, setNewCoordinate] = useState<Partial<TestCoordinate>>({
    type: 'commercial',
  });

  const filteredCoordinates = coordinates.filter(coord =>
    coord.name.toLowerCase().includes(search.toLowerCase()) ||
    coord.area.toLowerCase().includes(search.toLowerCase()) ||
    coord.lga.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newCoordinate.name || !newCoordinate.latitude || !newCoordinate.longitude) return;
    
    const coord: TestCoordinate = {
      id: `custom-${Date.now()}`,
      name: newCoordinate.name,
      latitude: Number(newCoordinate.latitude),
      longitude: Number(newCoordinate.longitude),
      area: newCoordinate.area || '',
      lga: newCoordinate.lga || '',
      type: newCoordinate.type || 'commercial',
    };

    onUpdate([...coordinates, coord]);
    setNewCoordinate({ type: 'commercial' });
    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    onUpdate(coordinates.filter(c => c.id !== id));
  };

  const handleEdit = (coord: TestCoordinate) => {
    setEditingId(coord.id);
    setNewCoordinate(coord);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    
    onUpdate(coordinates.map(c => 
      c.id === editingId 
        ? { ...c, ...newCoordinate } as TestCoordinate
        : c
    ));
    setEditingId(null);
    setNewCoordinate({ type: 'commercial' });
  };

  const getTypeBadge = (type: TestCoordinate['type']) => {
    const colors = {
      commercial: 'bg-purple-500/20 text-purple-400',
      residential: 'bg-blue-500/20 text-blue-400',
      mixed: 'bg-success/20 text-success',
    };

    return (
      <span className={`status-badge ${colors[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coordinates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="max-h-[400px] overflow-auto scrollbar-thin">
          <table className="data-table">
            <thead className="sticky top-0">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Area</th>
                <th>LGA</th>
                <th>Type</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoordinates.map((coord) => (
                <tr key={coord.id}>
                  <td className="font-mono text-xs text-muted-foreground">{coord.id}</td>
                  <td className="font-medium">{coord.name}</td>
                  <td className="font-mono text-sm">{coord.latitude.toFixed(4)}</td>
                  <td className="font-mono text-sm">{coord.longitude.toFixed(4)}</td>
                  <td className="text-sm text-muted-foreground">{coord.area}</td>
                  <td className="text-sm text-muted-foreground">{coord.lga}</td>
                  <td>{getTypeBadge(coord.type)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(coord)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(coord.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredCoordinates.length} of {coordinates.length} locations
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || !!editingId} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingId(null);
          setNewCoordinate({ type: 'commercial' });
        }
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name *</label>
              <Input
                placeholder="e.g., Victoria Island Mall"
                value={newCoordinate.name || ''}
                onChange={(e) => setNewCoordinate({ ...newCoordinate, name: e.target.value })}
                className="bg-muted/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Latitude *</label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="6.4281"
                  value={newCoordinate.latitude || ''}
                  onChange={(e) => setNewCoordinate({ ...newCoordinate, latitude: parseFloat(e.target.value) })}
                  className="bg-muted/50 font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Longitude *</label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="3.4219"
                  value={newCoordinate.longitude || ''}
                  onChange={(e) => setNewCoordinate({ ...newCoordinate, longitude: parseFloat(e.target.value) })}
                  className="bg-muted/50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Area</label>
                <Input
                  placeholder="e.g., Victoria Island"
                  value={newCoordinate.area || ''}
                  onChange={(e) => setNewCoordinate({ ...newCoordinate, area: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">LGA</label>
                <Input
                  placeholder="e.g., Eti-Osa"
                  value={newCoordinate.lga || ''}
                  onChange={(e) => setNewCoordinate({ ...newCoordinate, lga: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Type</label>
              <Select
                value={newCoordinate.type}
                onValueChange={(value) => setNewCoordinate({ ...newCoordinate, type: value as TestCoordinate['type'] })}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsAddDialogOpen(false);
              setEditingId(null);
              setNewCoordinate({ type: 'commercial' });
            }}>
              Cancel
            </Button>
            <Button onClick={editingId ? handleSaveEdit : handleAdd}>
              {editingId ? 'Save Changes' : 'Add Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
