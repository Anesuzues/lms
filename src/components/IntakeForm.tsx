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

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate checkboxes
        const checkboxes = formRef.current?.querySelectorAll('input[name="entry.403697090"]:checked');
        if (!checkboxes || checkboxes.length === 0) {
            toast.error("Please select at least one career interest");
            return;
        }

        setIsSubmitting(true);

        // Create hidden iframe if it doesn't exist
        let iframe = document.getElementById('hidden_iframe') as HTMLIFrameElement;
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'hidden_iframe';
            iframe.name = 'hidden_iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        // Set up iframe load handler BEFORE submitting
        const handleIframeLoad = () => {
            // Add a small delay to ensure the form was actually submitted
            setTimeout(() => {
                console.log('Form submission completed');
                setIsSubmitting(false);
                setIsSubmitted(true);
                toast.success("Registration successful!");
                
                if (onSuccess) {
                    setTimeout(onSuccess, 2000);
                }
                
                // Remove the event listener
                iframe.removeEventListener('load', handleIframeLoad);
            }, 500);
        };

        iframe.addEventListener('load', handleIframeLoad);

        // Debug: Log form data before submission
        const formData = new FormData(formRef.current);
        console.log('Submitting form with data:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Submit the form
        if (formRef.current) {
            console.log('Submitting to:', formRef.current.action);
            formRef.current.submit();
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
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h3 className="text-2xl font-bold text-white">Application Received!</h3>
                <p className="text-gray-400">
                    Thank you for registering. You will receive an email with Module 0 access shortly.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 bg-[#0f172a] text-white">
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSeicnftUC9dRZKALdSJugUxYTEJTQQrEyOoEjyzxtSExc2inQ/formResponse"
                method="POST"
                target="hidden_iframe"
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name and Surname */}
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-gray-300 font-semibold mb-2">
                            Name and surname? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="entry.484371361"
                            required
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 bg-[#1e293b] border-2 border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Email Address */}
                    <div>
                        <label htmlFor="email" className="block text-gray-300 font-semibold mb-2">
                            Email Address? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="entry.66967256"
                            required
                            placeholder="your.email@example.com"
                            className="w-full px-4 py-3 bg-[#1e293b] border-2 border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phone" className="block text-gray-300 font-semibold mb-2">
                            Phone number? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="entry.387778515"
                            required
                            placeholder="+27 XX XXX XXXX"
                            className="w-full px-4 py-3 bg-[#1e293b] border-2 border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Modules Covered */}
                    <div className="md:col-span-2">
                        <label htmlFor="modules" className="block text-gray-300 font-semibold mb-2">
                            Modules covered? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="modules"
                            name="entry.1700736970"
                            required
                            placeholder="List the modules you've covered"
                            className="w-full px-4 py-3 bg-[#1e293b] border-2 border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Career Interest */}
                    <div className="md:col-span-2">
                        <label className="block text-gray-300 font-semibold mb-2">
                            Career Interest (choose all that apply) <span className="text-red-500">*</span>
                        </label>
                        <div className="bg-[#1e293b] border-2 border-slate-700 rounded-lg p-4 space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="Social Media & Digital Marketing"
                                    className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                />
                                <span className="text-gray-300">Social Media & Digital Marketing</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="Videography & Content Creation"
                                    className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                />
                                <span className="text-gray-300">Videography & Content Creation</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="System support"
                                    className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                />
                                <span className="text-gray-300">System support</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="Network support"
                                    className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                />
                                <span className="text-gray-300">Network support</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="entry.403697090"
                                    value="Other"
                                    onChange={(e) => setShowOtherInput(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                />
                                <span className="text-gray-300">Other:</span>
                            </label>
                            {showOtherInput && (
                                <input
                                    type="text"
                                    name="entry.403697090.other_option_response"
                                    placeholder="Please specify"
                                    className="w-full px-4 py-2 bg-[#0f172a] border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none ml-8"
                                />
                            )}
                        </div>
                    </div>

                    {/* Program Name */}
                    <div className="md:col-span-2">
                        <label htmlFor="program" className="block text-gray-300 font-semibold mb-2">
                            Provide the program name you were on? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="program"
                            name="entry.1417367921"
                            required
                            placeholder="Program name"
                            className="w-full px-4 py-3 bg-[#1e293b] border-2 border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-2">
                        <label htmlFor="summary" className="block text-gray-300 font-semibold mb-2">
                            Give us a brief summary about yourself and your outcome from the qualification you are working towards?
                        </label>
                        <textarea
                            id="summary"
                            name="entry.420636245"
                            rows={4}
                            placeholder="Tell us about yourself and your goals..."
                            className="w-full px-4 py-3 bg-[#1e293b] border-2 border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all resize-vertical"
                        />
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                        <label htmlFor="location" className="block text-gray-300 font-semibold mb-2">
                            Where are you based? <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="entry.1642881079"
                            required
                            placeholder="City, Province"
                            className="w-full px-4 py-3 bg-[#1e293b] border-2 border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
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
                        className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
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
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                        Clear form
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IntakeForm;
