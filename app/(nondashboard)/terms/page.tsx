export default function TermsAndConditions() {
    const date = new Date().toLocaleDateString();
    return (
      <div className="px-6 py-8 text-black dark:text-white">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <p className="text-sm mb-6">Last updated: {date}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing and using Kubera, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">Kubera provides a wealth management platform designed to help users manage their investments and financial assets.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="mb-4">You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
        </section>
  
        {/* Add more sections as needed */}
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Contact Information</h2>
          <p className="mb-4">If you have any questions about these Terms, please contact us at ceo@ifinstrats.com</p>
        </section>
      </div>
    );
  }