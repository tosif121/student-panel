import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Loader2 } from 'lucide-react';
import { get } from '@/lib/api-utils';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Check for token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/student/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // Fetch data if token exists
  useEffect(() => {
    async function fetchHostelContact() {
      if (!token) return;

      const rawStudent = localStorage.getItem('student');
      const parsedStudent = rawStudent ? JSON.parse(rawStudent) : null;
      const studentId = parsedStudent?.studentId;

      if (!studentId) {
        localStorage.removeItem('token');
        localStorage.removeItem('student');
        router.push('/student/login');
        return;
      }

      try {
        const response = await get(`/getHostelContact/${studentId}`, token);
        if (response.success) {
          setStudentData(response.student);
        } else {
          setStudentData(null);
        }
      } catch {
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchHostelContact();
  }, [token, router]);

  // Handle invalid data case
  useEffect(() => {
    if (!loading && !studentData) {
      localStorage.removeItem('token');
      localStorage.removeItem('student');
      router.push('/student/login');
    }
  }, [loading, studentData, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-muted-foreground">Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg shadow-xl border-primary/20 p-0">
        <CardHeader className="bg-primary/5 p-4">
          <CardTitle className="flex items-center space-x-3 text-xl sm:text-2xl">
            <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span>Student Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="font-semibold text-lg text-foreground capitalize">{studentData?.studentName} Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Name</p>
                <p className="font-medium text-base capitalize">{studentData?.studentName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Registration ID</p>
                <p className="font-medium text-base capitalize">{studentData?.registrationId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Student ID</p>
                <p className="font-medium text-base capitalize">{studentData?.studentId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Admin</p>
                <p className="font-medium text-base capitalize">{studentData?.adminName}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-lg text-foreground">Guardian Numbers</p>
            <div className="flex flex-wrap gap-2">
              {studentData?.guardianNo?.length > 0 ? (
                studentData.guardianNo.map((number, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 font-mono text-base">
                    {number}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No guardian numbers found.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
