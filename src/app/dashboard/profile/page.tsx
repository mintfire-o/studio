
'use client';

import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UserCircle, KeyRound, Fingerprint, Edit } from 'lucide-react';
import type { UserProfile } from '@/types'; 

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [userDetails, setUserDetails] = useState<UserProfile | null>(null); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  // PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [isPinChanging, setIsPinChanging] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.username) {
        setIsLoadingData(true);
        try {
          const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Mock-Username': user.username
            },
          });

          let data;
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
          } else if (!response.ok) {
            const text = await response.text();
            const errorMessage = `Error fetching profile. Status: ${response.status}. Server response: ${text || 'No additional error message from server.'}`;
            toast({
              variant: 'destructive',
              title: 'Error fetching profile',
              description: errorMessage,
            });
            setUserDetails(null);
            setIsLoadingData(false);
            return;
          }


          if (response.ok && data?.user) {
            setUserDetails(data.user as UserProfile); 
          } else {
            toast({
              variant: 'destructive',
              title: 'Error fetching profile',
              description: data?.message || 'Could not load profile details.',
            });
            setUserDetails(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          let toastDescription = 'Failed to connect to the server to fetch profile details.';
          if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
            // Already specific enough from the catch block
          } else if (error instanceof Error) {
            toastDescription = error.message;
          }
          toast({
            variant: 'destructive',
            title: 'Network Error',
            description: toastDescription,
          });
          setUserDetails(null);
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setIsLoadingData(false);
      }
    };

    if (!authLoading) {
        fetchUserDetails();
    }
  }, [user, authLoading, toast]);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError("New password must be at least 6 characters long.");
      return;
    }
    if (!user?.username) return;

    setIsPasswordChanging(true);
    try {
      const response = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Mock-Username': user.username 
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else if (!response.ok) {
        const text = await response.text();
        const errorMessage = `Failed to update password. Status: ${response.status}. Server response: ${text || 'No additional error message from server.'}`;
        setPasswordChangeError(errorMessage);
        toast({ title: 'Update Failed', description: errorMessage, variant: 'destructive' });
        setIsPasswordChanging(false);
        return;
      }


      if (response.ok) {
        toast({ title: "Password Updated", description: data?.message || "Your password has been successfully changed." });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordChangeError(data?.message || `Failed to update password. Status: ${response.status}`);
      }
    } catch (error) {
        console.error("Error updating password:", error);
        let errorMsg = "An unexpected error occurred while updating your password.";
        let toastTitle = 'Update Failed';
        if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
            toastTitle = 'Network Error';
            errorMsg = 'Could not connect to server to update password. Please check your internet connection.';
        } else if (error instanceof Error) {
            errorMsg = error.message;
        }
        setPasswordChangeError(errorMsg);
        toast({
            title: toastTitle,
            description: errorMsg,
            variant: 'destructive'
        });
    } finally {
        setIsPasswordChanging(false);
    }
  };

  const handlePinChange = async (e: FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    if (newPin !== confirmNewPin) {
      setPinChangeError("New PINs do not match.");
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      setPinChangeError("New PIN must be exactly 6 digits.");
      return;
    }
    if (!user?.username) return;

    setIsPinChanging(true);
    try {
        const response = await fetch('/api/user/update-pin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Mock-Username': user.username 
            },
            body: JSON.stringify({ currentPin, newPin }),
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else if (!response.ok) {
            const text = await response.text();
            const errorMessage = `Failed to update PIN. Status: ${response.status}. Server response: ${text || 'No additional error message from server.'}`;
            setPinChangeError(errorMessage);
            toast({ title: 'Update Failed', description: errorMessage, variant: 'destructive' });
            setIsPinChanging(false);
            return;
        }


        if (response.ok) {
            toast({ title: "PIN Updated", description: data?.message || "Your PIN has been successfully changed." });
            setCurrentPin('');
            setNewPin('');
            setConfirmNewPin('');
        } else {
            setPinChangeError(data?.message || `Failed to update PIN. Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error updating PIN:", error);
        let errorMsg = "An unexpected error occurred while updating your PIN.";
        let toastTitle = 'Update Failed';
        if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
            toastTitle = 'Network Error';
            errorMsg = 'Could not connect to server to update PIN. Please check your internet connection.';
        } else if (error instanceof Error) {
            errorMsg = error.message;
        }
        setPinChangeError(errorMsg);
        toast({
            title: toastTitle,
            description: errorMsg,
            variant: 'destructive'
        });
    } finally {
        setIsPinChanging(false);
    }
  };

  const getDisplayPhoneNumber = () => {
    if (!userDetails) return 'Loading...';
    if (!userDetails.phoneNumber && !userDetails.countryCode) {
      return 'Not Provided';
    }

    const numberPart = userDetails.phoneNumber || '';
    const prefix = userDetails.countryCode || '';
    const cleanedNumberPart = numberPart.startsWith(prefix) ? numberPart.substring(prefix.length).trim() : numberPart.trim();

    let displayPhone = prefix;
    if (prefix && cleanedNumberPart) {
      displayPhone += ` ${cleanedNumberPart}`;
    } else if (cleanedNumberPart) {
      displayPhone = cleanedNumberPart;
    }

    return displayPhone.trim() || 'Not Provided';
  };


  if (authLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user || !userDetails) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Profile</AlertTitle>
        <AlertDescription>Could not load user profile details. Please try again or contact support if the issue persists.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center text-primary">
            <UserCircle className="mr-3 h-10 w-10" /> Profile Settings
          </CardTitle>
          <CardDescription className="text-lg">Manage your account details and security settings below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-muted/30 rounded-lg border">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Full Name</Label>
              <p className="text-lg font-medium">{userDetails.fullName || 'Not Provided'}</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Username</Label>
              <p className="text-lg font-medium">{userDetails.username}</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Email</Label>
              <p className="text-lg font-medium">{userDetails.email || 'Not Provided'}</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Phone Number</Label>
              <p className="text-lg font-medium">{getDisplayPhoneNumber()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg border-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <KeyRound className="mr-2 h-6 w-6 text-secondary-foreground" /> Change Password
            </CardTitle>
            <CardDescription>Update your account password. Make sure it's secure!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="Enter your current password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password (min. 6 characters)</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Enter new password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required placeholder="Confirm new password" />
              </div>
              {passwordChangeError && <p className="text-sm text-destructive font-medium text-center py-1">{passwordChangeError}</p>}
              <Button type="submit" disabled={isPasswordChanging} className="w-full text-base py-2.5">
                {isPasswordChanging ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Edit className="mr-2 h-5 w-5" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-accent/50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Fingerprint className="mr-2 h-6 w-6 text-accent-foreground" /> Change PIN
            </CardTitle>
            <CardDescription>Update your 6-digit security PIN for quick access.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinChange} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input id="currentPin" type="password" value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required placeholder="Enter current 6-digit PIN" className="tracking-[0.2em]" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPin">New PIN (must be 6 digits)</Label>
                <Input id="newPin" type="password" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required placeholder="Enter new 6-digit PIN" className="tracking-[0.2em]" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmNewPin">Confirm New PIN</Label>
                <Input id="confirmNewPin" type="password" value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required placeholder="Confirm new 6-digit PIN" className="tracking-[0.2em]" />
              </div>
              {pinChangeError && <p className="text-sm text-destructive font-medium text-center py-1">{pinChangeError}</p>}
              <Button type="submit" disabled={isPinChanging} className="w-full text-base py-2.5">
                {isPinChanging ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Edit className="mr-2 h-5 w-5" />}
                Update PIN
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
