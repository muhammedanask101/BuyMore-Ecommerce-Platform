export default function ContactPage() {
  return (
    <main className="px-8 py-10 md:py-16 max-w-3xl mx-auto">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-sm text-gray-600">
          Have a question, feedback, or business inquiry? We’d love to hear from you.
        </p>
      </div>

      {/* Contact Card */}
      <div className="border-2 border-black p-6 md:p-8 space-y-6">
        {/* Email */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</p>
          <a href="mailto:officiallbuymorestore@gmail.com" className="font-medium hover:underline">
            officialbuymorestore@gmail.com
          </a>
        </div>

        {/* Phone */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Phone</p>
          <a href="tel:+919876543210" className="font-medium hover:underline">
            +91 98472 41611
          </a>
        </div>

        {/* Address */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Location</p>
          <p className="font-medium">Kerala, India</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-black/10" />

        {/* Note */}
        <p className="text-sm text-gray-600">
          For order-related queries, please include your name and phone number so we can assist you
          faster.
        </p>
      </div>
    </main>
  );
}
