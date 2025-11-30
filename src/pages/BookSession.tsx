// src/pages/BookSession.tsx
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Props = {
  teacherId: string;
  onClose: () => void;
};

const BookSession = ({ teacherId, onClose }: Props) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please login as a learner first");
        setIsSubmitting(false);
        return;
      }

      // write booking request
      await addDoc(collection(db, "teacher_requests"), {
        teacher_id: teacherId,
        learner_id: user.uid,
        learner_email: user.email || null,
        date,
        time,
        topic,
        status: "pending",
        created_at: new Date(),
      });

      toast.success("Session request sent");
      onClose();
    } catch (err: any) {
      console.error("Booking failed:", err);
      toast.error("Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4">Request a Session</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Preferred Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div>
            <Label>Preferred Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>

          <div>
            <Label>Topic / Notes</Label>
            <Input placeholder="What do you want to cover?" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" className="bg-gradient-primary text-white" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookSession;
