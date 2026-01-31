export default function AboutPage() {
  return (
    <main className="px-4 py-10 md:py-16 max-w-4xl mx-auto">
      {/* HERO */}
      <section className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">About Kapithan</h1>
        <p className="text-base md:text-lg text-gray-700 max-w-2xl">
          Kapithan is a modern homegrown brand focused on thoughtful products, honest pricing, and a
          shopping experience that feels human.
        </p>
      </section>

      {/* STORY */}
      <section className="mb-12 border-2 border-black p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-3">Our Story</h2>
        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
          Kapithan was created with a simple idea: selling products should feel personal, not
          transactional. We believe every order represents trust, and we treat it that way — from
          how we curate our products to how we communicate with our customers.
        </p>
      </section>

      {/* VALUES */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">What We Stand For</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="border-2 border-black p-5">
            <h3 className="font-medium mb-2">Quality First</h3>
            <p className="text-sm text-gray-700">
              Every product is selected with attention to quality, durability, and usefulness.
            </p>
          </div>

          <div className="border-2 border-black p-5">
            <h3 className="font-medium mb-2">Honest Experience</h3>
            <p className="text-sm text-gray-700">
              Clear communication, transparent pricing, and no unnecessary complexity.
            </p>
          </div>

          <div className="border-2 border-black p-5">
            <h3 className="font-medium mb-2">Customer Respect</h3>
            <p className="text-sm text-gray-700">
              We value your time, privacy, and trust — always.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t-2 border-black pt-8">
        <p className="text-sm text-gray-700 max-w-xl">
          We’re continuously improving and expanding — and we’re grateful to everyone who chooses
          Kapithan. If you have questions, feedback, or just want to say hello, we’d love to hear
          from you.
        </p>
      </section>
    </main>
  );
}
