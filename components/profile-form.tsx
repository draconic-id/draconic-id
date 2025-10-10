'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LocationPicker from '@/components/location-picker';
import { Info, TriangleAlert } from 'lucide-react';

interface ProfileFormProps {
    action: (formData: FormData) => void;
    profile: {
        user: { name: string };
        tagline: string | null;
        latitude: number | null;
        longitude: number | null;
        privacy: 'PUBLIC' | 'UNLISTED' | 'HIDDEN' | 'PRIVATE';
    };
}

export default function ProfileForm({ action, profile }: ProfileFormProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        let totalSize = 0;
        for (const [, value] of formData.entries()) {
            if (value instanceof File) totalSize += value.size;
            else totalSize += new Blob([value]).size;
        }
        if (totalSize > 1024 * 1024) {
            e.preventDefault();
            alert('Your profile could not be saved. The data you entered exceeds the size limit.');
            return;
        }
    };

    console.log(profile.privacy);

    return (
        <form action={action} onSubmit={handleSubmit}>
            <div className="grid gap-4 mt-8 mb-8">
                <div className="grid gap-3">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" name="name" defaultValue={profile.user.name} placeholder="Bluefire" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" name="tagline" defaultValue={profile.tagline || ''} placeholder="A western dragon with black scales and blue eyes." />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="banner">Avatar</Label>
                    <Alert variant="default">
                        <Info />
                        <AlertDescription>
                            <p>Images that are not square will be cropped. All common formats are accepted. There is a size limit of 1 MB.</p>
                        </AlertDescription>
                    </Alert>
                    <Input id="avatar" name="avatar" type="file" accept="image/*" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="privacy">Privacy</Label>
                    <Select name="privacy" defaultValue={profile.privacy}>
                        {/* Full-width control */}
                        <SelectTrigger multiline className="w-full">
                            <SelectValue placeholder="Select profile privacy" />
                        </SelectTrigger>

                        {/* Content grows to fit text; never smaller than trigger */}
                        <SelectContent>
                            <SelectItem value="PUBLIC" className="items-start">
                                <div className="flex max-w-full flex-col items-start">
                                    <span className="font-medium leading-tight">Public</span>
                                    <span className="mt-1 text-xs leading-snug text-muted-foreground whitespace-normal break-words text-left">
                                        Your profile is visible to anyone on the internet.
                                    </span>
                                </div>
                            </SelectItem>

                            <SelectItem value="UNLISTED" className="items-start">
                                <div className="flex max-w-full flex-col items-start">
                                    <span className="font-medium leading-tight">Unlisted</span>
                                    <span className="mt-1 text-xs leading-snug text-muted-foreground whitespace-normal break-words text-left">
                                        Your profile is public, but won't be indexed by search engines.
                                    </span>
                                </div>
                            </SelectItem>

                            <SelectItem value="HIDDEN" className="items-start">
                                <div className="flex max-w-full flex-col items-start">
                                    <span className="font-medium leading-tight">Hidden</span>
                                    <span className="mt-1 text-xs leading-snug text-muted-foreground whitespace-normal break-words text-left">
                                        Your profile is only visible to dragons who are currently logged in.
                                    </span>
                                </div>
                            </SelectItem>

                            <SelectItem value="PRIVATE" className="items-start">
                                <div className="flex max-w-full flex-col items-start">
                                    <span className="font-medium leading-tight">Private</span>
                                    <span className="mt-1 text-xs leading-snug text-muted-foreground whitespace-normal break-words text-left">
                                        No one's able to see your profile. Use this if you're still working on it.
                                    </span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                </div>
                <div className="grid gap-3">
                    <Label htmlFor="location">Latitude and longitude</Label>
                    <Alert variant="default">
                        <TriangleAlert />
                        <AlertDescription>
                            <p>Locations are public. Never provide the exact coordinates of where you live. Choose another nearby location instead.</p>
                        </AlertDescription>
                    </Alert>
                    <LocationPicker
                        initialLatitude={profile.latitude || undefined}
                        initialLongitude={profile.longitude || undefined}
                    />
                </div>

            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
            </DialogFooter>
        </form>
    );
}