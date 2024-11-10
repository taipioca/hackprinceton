"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { PlusCircle, X } from "lucide-react";

export interface MemoryItem {
  type: "person" | "object";
  name: string;
  memories: string[];
  images: string[];
  object_type: string;
}

const UpdateModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"person" | "object">("person");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [data, setData] = useState<MemoryItem | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const form = useForm<MemoryItem>({
    defaultValues: {
      type: "person",
      name: "",
      memories: [],
      images: [],
      object_type: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetch("http://127.0.0.1:5000/dump_memory")
        .then((res) => res.json())
        .then((memories) => {
          const filteredFiles = memories
            .filter((memory: MemoryItem) => memory.object_type === type)
            .map((memory: MemoryItem) => memory.name);
          setFiles(filteredFiles);
        })
        .catch((err) => console.error("Error fetching memories", err));
    }
  }, [open, type]);

  useEffect(() => {
    if (selectedFile) {
      fetch(`http://127.0.0.1:5000/get_memory?name=${selectedFile}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          form.reset(data);
        })
        .catch((err) => console.error("Error fetching data", err));
    }
  }, [selectedFile, form]);

  const handleSubmit = form.handleSubmit((formData) => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("object_type", formData.object_type);
    formDataToSend.append("memories", formData.memories.join("|"));

    imageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    fetch(`http://127.0.0.1:5000/edit_memory/${formData.name}`, {
      method: "PATCH",
      body: formDataToSend,
    })
      .then(() => {
        alert("Updated successfully");
        setOpen(false);
        form.reset();
        setImageFiles([]);
      })
      .catch((err) => console.error("Update failed", err));
  });

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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFiles(Array.from(event.target.files));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="tracking-tight">
          edit a past memory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="tracking-tight">
            edit a past memory
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        setType(value as "person" | "object");
                      }}
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
            <FormItem>
              <FormLabel>Select Item</FormLabel>
              <Select onValueChange={setSelectedFile}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a file" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {files.map((file) => (
                    <SelectItem key={file} value={file}>
                      {file.replace(".json", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            {data && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                            <Textarea {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMemory(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMemory}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Memory
                  </Button>
                </div>
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <Input type="file" multiple onChange={handleImageChange} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    You can upload multiple images. New images will replace old
                    ones.
                  </p>
                </FormItem>
              </>
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

export default UpdateModal;
