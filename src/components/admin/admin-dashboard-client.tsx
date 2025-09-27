"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Building, Search, Edit, Phone, MapPin, MoreHorizontal, Trash2 } from "lucide-react";
import AddInstitutionSheet from "./add-institution-sheet";
import EditInstitutionSheet from "./edit-institution-sheet";

interface Institution {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string | null;
  board: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  organizationId: string;
}

interface AdminDashboardClientProps {
  institutions: Institution[];
}

export default function AdminDashboardClient({ institutions }: AdminDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deletingInstitution, setDeletingInstitution] = useState<string | null>(null);

  const filteredInstitutions = useMemo(() => {
    if (!searchQuery.trim()) return institutions;

    const query = searchQuery.toLowerCase();
    return institutions.filter(inst =>
      inst.name.toLowerCase().includes(query) ||
      inst.type.toLowerCase().includes(query) ||
      inst.city.toLowerCase().includes(query) ||
      inst.state?.toLowerCase().includes(query) ||
      inst.board?.toLowerCase().includes(query)
    );
  }, [institutions, searchQuery]);

  const handleEditInstitution = (institution: Institution) => {
    setEditingInstitution(institution);
    setEditSheetOpen(true);
  };

  const handleEditSheetClose = () => {
    setEditSheetOpen(false);
    setEditingInstitution(null);
  };

  const handleDeleteInstitution = async (institutionId: string) => {
    if (!confirm("Are you sure you want to delete this institution? This action cannot be undone.")) {
      return;
    }

    setDeletingInstitution(institutionId);

    try {
      const response = await fetch(`/api/institutions/${institutionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete institution');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting institution:', error);
      alert('Failed to delete institution. Please try again.');
    } finally {
      setDeletingInstitution(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Institution Management</h2>
          <p className="text-gray-600">
            Manage educational institutions and their details
          </p>
        </div>
        <AddInstitutionSheet />
      </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>Institutions ({filteredInstitutions.length})</span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search institutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {institutions.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No institutions added yet</p>
                <AddInstitutionSheet />
              </div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No institutions found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Locations</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstitutions.map((inst) => (
                      <TableRow key={inst.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900">{inst.name}</div>
                            <div className="text-sm text-gray-500">{inst.type}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={inst.isActive ? "default" : "destructive"}
                            className={inst.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                          >
                            {inst.isActive ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            {inst.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span>{inst.phone}</span>
                              </div>
                            )}
                            {inst.email && (
                              <div className="text-gray-600 mt-1">{inst.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{inst.city}{inst.state ? `, ${inst.state}` : ''}</span>
                          </div>
                          {inst.board && (
                            <div className="text-xs text-gray-500 mt-1">{inst.board}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={deletingInstitution === inst.id}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                              <DropdownMenuItem onClick={() => handleEditInstitution(inst)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteInstitution(inst.id)}
                                className="text-red-600 focus:text-red-600"
                                disabled={deletingInstitution === inst.id}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deletingInstitution === inst.id ? "Deleting..." : "Delete"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <EditInstitutionSheet
          institution={editingInstitution}
          open={editSheetOpen}
          onOpenChange={handleEditSheetClose}
        />
    </div>
  );
}