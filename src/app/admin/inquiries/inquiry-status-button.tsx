"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  inquiryId: string;
  currentStatus: string;
};

export function InquiryStatusButton({ inquiryId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setLoading(true);

    await fetch(`/api/inquiries/${inquiryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setLoading(false);
    router.refresh();
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="open">未対応</SelectItem>
        <SelectItem value="in_progress">対応中</SelectItem>
        <SelectItem value="resolved">解決済み</SelectItem>
      </SelectContent>
    </Select>
  );
}
