"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { PlusCircle, X } from "lucide-react";

const UploadModal: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      type: "person",
      name: "",
      memories: [""],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleAddMemory = () => {
    const currentMemories = form.getValues("memories");
    form.setValue("memories", [...currentMemories, ""]);
  };

  const handleRemoveMemory = (index: number) => {
    const currentMemories = form.getValues("memories");
    form.setValue(
      "memories",
      currentMemories.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (!data.name) {
      alert("Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("object_type", data.type);
    formData.append("memories", data.memories.join("|"));

    images.forEach((file) => {
      formData.append("images", file);
    });

    fetch("http://127.0.0.1:5000/create_memory", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then(() => {
        alert("Uploaded successfully");
        setOpen(false);
        form.reset();
        setImages([]);
      })
      .catch((err) => console.error("Upload failed", err));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="tracking-tight">create a new memory!</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="tracking-tight">
            create a new memory!
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="person" />
                        </FormControl>
                        <FormLabel className="font-normal">Person</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="object" />
                        </FormControl>
                        <FormLabel className="font-normal">Object</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Memories</FormLabel>
              {form.watch("memories").map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`memories.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Textarea placeholder="Enter a memory" {...field} />
                      </FormControl>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMemory(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" onClick={handleAddMemory}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Memory
              </Button>
            </div>
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <Input type="file" multiple onChange={handleFileChange} />
              </FormControl>
            </FormItem>
            {images.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected files: {images.map((img) => img.name).join(", ")}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
