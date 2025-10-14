'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LocationPicker from '@/components/location-picker';
import { Info, TriangleAlert, Plus, X, GripVertical, Egg } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function toUtcDate(date: Date | undefined) {
    if (!date) return undefined;
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function fromUtcDate(date: Date | undefined) {
    if (!date) return undefined;
    // Converts UTC midnight -> local date at same calendar day
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    );
}

interface ProfileFormProps {
    action: (formData: FormData) => void;
    profile: {
        user: { name: string };
        tagline: string | null;
        color: string | null;
        latitude: number | null;
        longitude: number | null;
        privacy: 'PUBLIC' | 'UNLISTED' | 'HIDDEN' | 'PRIVATE';
        birthDate: Date | null;
        showAge: boolean;
        links: { name: string; url: string }[] | null;
    };
}

export default function ProfileForm({ action, profile }: ProfileFormProps) {
    const [showColorPicker, setShowColorPicker] = useState(!!profile.color);
    const [savePending, setSavePending] = useState(false);
    const [birthDate, setBirthDate] = useState<Date | undefined>(profile.birthDate || undefined);
    const [showAge, setShowAge] = useState(profile.showAge);
    const [links, setLinks] = useState<{ name: string; url: string }[]>(
        profile.links || []
    );
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // disable save buttons
        setSavePending(true);

        // disable browser's default handling of forms
        e.preventDefault();

        //retrieve form data
        const formData = new FormData(e.currentTarget);

        // check whether size limit is not exceeded
        const sizeLimit = 1024 * 2024 // size limit in bytes
        let totalSize = 0;
        for (const [, value] of formData.entries()) {
            totalSize += value instanceof File ? value.size : new Blob([value]).size;
        }
        if (totalSize > sizeLimit) {
            // alert user
            toast.error("Your profile could not be saved because the size limit was exceeded.")
            // enable save buttons
            setSavePending(false);
            // return early
            return
        }

        // execute server action and refresh page
        await action(formData)
        router.refresh();

        // enable save buttons
        setSavePending(false);
        toast.success("Your profile information was updated successfully.");
    };

    return (
        <form action={action} onSubmit={handleSubmit}>
            <div className="grid gap-4 mt-8 mb-8">
                <div className="grid gap-3">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" name="name" defaultValue={profile.user.name} placeholder="Bluefire" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" name="tagline" maxLength={128} defaultValue={profile.tagline || ''} placeholder="A western dragon with black scales and blue eyes." />
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
                    <Label htmlFor="color">Color</Label>
                    <Alert variant="default">
                        <Info />
                        <AlertDescription>
                            <p>Add a color theme to your profile. Leave empty for the standard light/dark theme with optimal readability.</p>
                        </AlertDescription>
                    </Alert>
                    <div className="flex gap-2 items-center">
                        {showColorPicker ? (
                            <>
                                <Input id="color" name="color" type="color" defaultValue={profile.color || '#000000'} className="w-16 h-10 p-1" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowColorPicker(false)}
                                >
                                    Reset
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowColorPicker(true)}
                                >
                                    Add Color
                                </Button>
                                <input type="hidden" name="color" value="" />
                            </>
                        )}
                    </div>
                </div>
                <div className="grid gap-3">
                    <Label>Hatch Date</Label>
                    <div className="space-y-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <Egg className="mr-2 h-4 w-4" />
                                    {birthDate ? format(birthDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={fromUtcDate(birthDate)}
                                    onSelect={(d) => setBirthDate(toUtcDate(d))}
                                    captionLayout="dropdown"
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="showAge"
                                checked={showAge}
                                onCheckedChange={(checked) => setShowAge(!!checked)}
                            />
                            <Label htmlFor="showAge" className="text-sm font-normal">
                                Show age on profile
                            </Label>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setBirthDate(undefined)}
                            disabled={!birthDate}
                        >
                            Clear Date
                        </Button>
                        <input
                            type="hidden"
                            name="birthDate"
                            value={birthDate ? birthDate.toISOString() : ""}
                        />
                        <input type="hidden" name="showAge" value={showAge.toString()} />
                    </div>
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="location">Latitude and Longitude</Label>
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
                <div className="grid gap-3">
                    <Label>Links</Label>
                    <Alert variant="default">
                        <Info />
                        <AlertDescription>
                            <p>Special icons are automatically inserted for links to common sites like Telegram or Discord.</p>
                        </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                        {links.map((link, index) => (
                            <div
                                key={index}
                                className="flex gap-2 items-center"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (draggedIndex !== null && draggedIndex !== index) {
                                        const newLinks = [...links];
                                        const draggedItem = newLinks[draggedIndex];
                                        newLinks.splice(draggedIndex, 1);
                                        newLinks.splice(index, 0, draggedItem);
                                        setLinks(newLinks);
                                    }
                                    setDraggedIndex(null);
                                }}
                            >
                                <div
                                    className="cursor-grab active:cursor-grabbing"
                                    draggable
                                    onDragStart={() => setDraggedIndex(index)}
                                    onDragEnd={() => setDraggedIndex(null)}
                                >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    name={`link-name-${index}`}
                                    placeholder="Name"
                                    value={link.name}
                                    onChange={(e) => {
                                        const newLinks = [...links];
                                        newLinks[index].name = e.target.value;
                                        setLinks(newLinks);
                                    }}
                                />
                                <Input
                                    name={`link-url-${index}`}
                                    placeholder="https://example.com"
                                    value={link.url}
                                    onChange={(e) => {
                                        const newLinks = [...links];
                                        newLinks[index].url = e.target.value;
                                        setLinks(newLinks);
                                    }}
                                />
                                <div
                                    className="cursor-pointer p-1"
                                    onClick={() => setLinks(links.filter((_, i) => i !== index))}
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLinks([...links, { name: '', url: '' }])}
                        >
                            Add Link
                        </Button>
                    </div>
                    <input type="hidden" name="links" value={JSON.stringify(links)} />
                </div>

            </div>
            <DialogFooter>
                <Button type="submit" disabled={savePending} aria-disabled={savePending}>
                    {savePending ? 'Saving…' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    );
}