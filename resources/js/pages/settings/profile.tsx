import { Form, Head, usePage } from "@inertiajs/react";
import { Crop, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ProfileController from "@/actions/App/Http/Controllers/Settings/ProfileController";
import DeleteUser from "@/components/delete-user";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInitials } from "@/hooks/use-initials";
import { edit } from "@/routes/profile";
import type { Auth } from "@/types";

type PageProps = {
    auth: Auth;
};

export default function Profile() {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
    const [cropScale, setCropScale] = useState(1.35);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const cropImageRef = useRef<HTMLDivElement | null>(null);

    const clampCropScale = (nextScale: number) => Math.min(2.8, Math.max(1, nextScale));

    const previewUrl = useMemo(() => {
        if (! selectedImage) {
            return auth.user.avatar ?? null;
        }

        return selectedImage;
    }, [auth.user.avatar, selectedImage]);

    useEffect(() => {
        return () => {
            if (selectedImage?.startsWith("blob:")) {
                URL.revokeObjectURL(selectedImage);
            }
        };
    }, [selectedImage]);

    const resetCropState = () => {
        setCropPosition({ x: 0, y: 0 });
        setCropScale(1.35);
    };

    const handleAvatarSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSourceFile(file);
        setSelectedImage(URL.createObjectURL(file));
        resetCropState();
    };

    const applyCrop = async () => {
        if (!sourceFile || !selectedImage || !fileInputRef.current) {
            return;
        }

        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Unable to load the selected image."));
            img.src = selectedImage;
        });

        const canvas = document.createElement("canvas");
        const size = 512;
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");

        if (!context) {
            return;
        }

        context.clearRect(0, 0, size, size);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, size, size);

        const scale = Math.max(1, cropScale);
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;
        const cropSize = Math.min(naturalWidth, naturalHeight);
        const sourceX = (naturalWidth - cropSize) / 2;
        const sourceY = (naturalHeight - cropSize) / 2;
        const displaySize = size / scale;
        const offsetX = (cropPosition.x * 2) / scale;
        const offsetY = (cropPosition.y * 2) / scale;

        const drawWidth = displaySize * scale;
        const drawHeight = displaySize * scale;

        context.save();
        context.translate(size / 2 + offsetX, size / 2 + offsetY);
        context.translate(-size / 2, -size / 2);
        context.beginPath();
        context.rect(0, 0, size, size);
        context.clip();
        context.drawImage(
            image,
            sourceX,
            sourceY,
            cropSize,
            cropSize,
            0,
            0,
            drawWidth,
            drawHeight,
        );
        context.restore();

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png");
        });

        if (!blob) {
            return;
        }

        const croppedFile = new File([blob], sourceFile.name.replace(/\.[^/.]+$/, ".png"), {
            type: "image/png",
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(croppedFile);
        fileInputRef.current.files = dataTransfer.files;

        setSelectedImage(URL.createObjectURL(blob));
        setSourceFile(croppedFile);
        setIsDragging(false);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!cropImageRef.current) {
            return;
        }

        setIsDragging(true);
        setDragStart({
            x: event.clientX - cropPosition.x,
            y: event.clientY - cropPosition.y,
        });
        cropImageRef.current.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) {
            return;
        }

        const nextX = event.clientX - dragStart.x;
        const nextY = event.clientY - dragStart.y;

        setCropPosition({
            x: Math.max(-120, Math.min(120, nextX)),
            y: Math.max(-120, Math.min(120, nextY)),
        });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const adjustZoom = (delta: number) => {
        setCropScale((currentScale) => clampCropScale(currentScale + delta));
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        event.preventDefault();
        adjustZoom(event.deltaY < 0 ? 0.2 : -0.2);
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your picture, name, and email address"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="avatar">Profile picture</Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-16">
                                        <AvatarImage src={previewUrl ?? undefined} alt={auth.user.name} />
                                        <AvatarFallback>
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Input
                                        ref={fileInputRef}
                                        id="avatar"
                                        type="file"
                                        name="avatar"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="max-w-md"
                                        onChange={handleAvatarSelection}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    JPG, PNG, or WebP. Maximum file size: 5 MB.
                                </p>
                                {selectedImage && (
                                    <div className="mt-2 rounded-xl border border-border bg-muted/30 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Crop className="h-4 w-4" />
                                                Crop your photo
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedImage(null);
                                                    setSourceFile(null);
                                                    resetCropState();
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = "";
                                                    }
                                                }}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Reset
                                            </Button>
                                        </div>

                                        <div className="mx-auto flex max-w-md flex-col gap-4">
                                            <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-4 border-white/90 bg-black/10 shadow-[0_0_0_1px_rgba(15,23,42,0.08)]" />
                                                <div className="absolute inset-3 overflow-hidden rounded-full border border-border bg-background shadow-inner">
                                                    <div
                                                        ref={cropImageRef}
                                                        className="absolute inset-0 h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
                                                        onPointerDown={handlePointerDown}
                                                        onPointerMove={handlePointerMove}
                                                        onPointerUp={handlePointerUp}
                                                        onPointerLeave={handlePointerUp}
                                                        onWheel={handleWheel}
                                                        style={{
                                                            transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropScale})`,
                                                            transformOrigin: "center center",
                                                        }}
                                                    >
                                                        <img
                                                            src={selectedImage}
                                                            alt="Profile preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 rounded-full ring-2 ring-ring ring-offset-2 ring-offset-background" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Zoom</span>
                                                    <span>{cropScale.toFixed(1)}x</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => adjustZoom(-0.2)}
                                                    >
                                                        −
                                                    </Button>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="2.8"
                                                        step="0.1"
                                                        value={cropScale}
                                                        onChange={(event) =>
                                                            setCropScale(
                                                                clampCropScale(Number(event.target.value)),
                                                            )
                                                        }
                                                        className="w-full accent-emerald-600"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => adjustZoom(0.2)}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="text-center text-xs text-muted-foreground">
                                                Drag to reposition and scroll to zoom.
                                            </p>

                                            <Button type="button" onClick={applyCrop} className="w-full">
                                                Use this crop
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <InputError className="mt-2" message={errors.avatar} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing} data-test="update-profile-button">
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: "Profile settings",
            href: edit(),
        },
    ],
};
