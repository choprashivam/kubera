export default function PrivacyPolicy() {
    const date = new Date().toLocaleDateString();
    return (
      <div className="px-6 py-8 text-black dark:text-white">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm mb-6">Last updated: {date}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">Welcome to Kubera. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our wealth management platform.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="tmb-4">We collect information that you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Personal information (e.g., name, email address, phone number)</li>
            <li>Financial information</li>
            <li>Investment preferences</li>
          </ul>
        </section>
  
        {/* Add more sections as needed */}
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at ceo@ifinstrats.com</p>
        </section>
      </div>
    );
  }