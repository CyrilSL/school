"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Building, MapPin, GraduationCap, Mail, Phone, Globe } from "lucide-react";
import AddInstitutionSheet from "./add-institution-sheet";

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
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-16">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to the admin panel. Manage users and system settings.
              </p>
            </div>
            <AddInstitutionSheet />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Institutions ({institutions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {institutions.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No institutions added yet</p>
                <AddInstitutionSheet />
              </div>
            ) : (
              <div className="space-y-4">
                {institutions.map((inst) => (
                  <div key={inst.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{inst.name}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {inst.type}
                          </span>
                          {inst.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{inst.city}{inst.state ? `, ${inst.state}` : ''}</span>
                          </div>

                          {inst.board && (
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4 text-gray-400" />
                              <span>{inst.board}</span>
                            </div>
                          )}

                          {inst.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{inst.email}</span>
                            </div>
                          )}

                          {inst.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{inst.phone}</span>
                            </div>
                          )}

                          {inst.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a href={inst.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                Website
                              </a>
                            </div>
                          )}
                        </div>

                        {inst.address && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Address:</span> {inst.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}