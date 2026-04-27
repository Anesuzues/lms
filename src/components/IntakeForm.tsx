import { useState, useRef, FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IntakeFormProps {
    onSuccess?: () => void;
}

const IntakeForm = ({ onSuccess }: IntakeFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate checkboxes
        const checkboxes = formRef.current?.querySelectorAll('input[name="entry.403697090"]:checked');
        if (!checkboxes || checkboxes.length === 0) {
            toast.error("Please select at least one career interest");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const actionUrl = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeicnftUC9dRZKALdSJugUxYTEJTQQrEyOoEjyzxtSExc2inQ/formResponse";

        try {
            await fetch(actionUrl, {
                method: "POST",
                mode: "no-cors",
                body: formData
            });

            console.log('Form submission completed');
            setIsSubmitting(false);
            setIsSubmitted(true);
            toast.success("Registration successful!");
            
            if (onSuccess) {
                setTimeout(onSuccess, 2000);
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to submit the form. Please try again.");
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        if (formRef.current) {
            formRef.current.reset();
        }
        setShowOtherInput(false);
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 animate-scale-in">
                <CheckCircle2 className="w-16 h-16 text-primary" />
                <h3 className="text-2xl font-bold tracking-tight">Application Received!</h3>
                <p className="text-muted-foreground">
                    Thank you for registering. You will receive an email with Module 0 access shortly.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 text-foreground">
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name and Surname */}
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-foreground font-semibold mb-2">
                            Name and surname? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="entry.484371361"
                            required
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow focus:outline-none transition-all"
                        />
                    </div>

                    {/* Email Address */}
                    <div>
                        <label htmlFor="email" className="block text-foreground font-semibold mb-2">
                            Email Address? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="entry.66967256"
                            required
                            placeholder="your.email@example.com"
                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow focus:outline-none transition-all"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phone" className="block text-foreground font-semibold mb-2">
                            Phone number? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="entry.387778515"
                            required
                            placeholder="+27 XX XXX XXXX"
                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow focus:outline-none transition-all"
                        />
                    </div>

                    {/* Modules Covered */}
                    <div className="md:col-span-2">
                        <label htmlFor="modules" className="block text-foreground font-semibold mb-2">
                            Modules covered? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="modules"
                            name="entry.1700736970"
                            required
                            placeholder="List the modules you've covered"
                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow focus:outline-none transition-all"
                        />
                    </div>

                    {/* Career Interest */}
                    <div className="md:col-span-2">
                        <label className="block text-foreground font-semibold mb-2">
                            Career Interest (choose all that apply) <span className="text-red-500">*</span>
                        </label>
                        <div className="glass-panel rounded-lg p-4 space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="Social Media & Digital Marketing"
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-foreground">Social Media & Digital Marketing</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="Videography & Content Creation"
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-foreground">Videography & Content Creation</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="System support"
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-foreground">System support</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="Network support"
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-foreground">Network support</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="Other"
                                    onChange={(e) => setShowOtherInput(e.target.checked)}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-foreground">Other:</span>
                            </label>
                            {showOtherInput && (
                                <input
                                    type="text"
                                    name="entry.403697090.other_option_response"
                                    placeholder="Please specify"
                                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow focus:outline-none ml-8 transition-all"
                                />
                            )}
                        </div>
                    </div>

                    {/* Program Name */}
                    <div className="md:col-span-2">
                        <label htmlFor="program" className="block text-foreground font-semibold mb-2">
                            Provide the program name you were on? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="program"
                            name="entry.1417367921"
                            required
                            placeholder="Program name"
                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow focus:outline-none transition-all"
                        />
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-2">
                        <label htmlFor="summary" className="block text-foreground font-semibold mb-2">
                            Give us a brief summary about yourself and your outcome from the qualification you are working towards?
                        </label>
                        <textarea
                            id="summary"
                            name="entry.420636245"
                            rows={4}
                            placeholder="Tell us about yourself and your goals..."
                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow focus:outline-none transition-all resize-vertical"
                        />
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                        <label htmlFor="location" className="block text-foreground font-semibold mb-2">
                            Where are you based? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="entry.1642881079"
                            required
                            placeholder="City, Province"
                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:shadow-glow focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Hidden Fields */}
                <input type="hidden" name="fvv" value="1" />
                <input type="hidden" name="fbzx" value="-743813356216699381" />

                {/* Buttons */}
                <div className="flex items-center justify-between pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-full transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-glow hover:scale-105"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>

                    <button
                        type="button"
                        onClick={clearForm}
                        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                    >
                        Clear form
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IntakeForm;
