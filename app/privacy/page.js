export const metadata = {
  title: "Privacy Policy - Fairway Edge",
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#8b949e", fontSize: 14, marginBottom: 24 }}>Last updated: {new Date().toLocaleDateString()}</p>

      <h2 style={sectionHeading}>Information we collect</h2>
      <p>
        When you create an account, we collect your email address and password. Your
        password is never stored by us directly -- account creation and login are handled
        by Amazon Cognito, a third-party identity service.
      </p>
      <p>
        If you subscribe to premium features, payment is processed by Stripe. We do not
        collect or store your card details -- Stripe handles that directly, and we only
        receive your subscription status.
      </p>

      <h2 style={sectionHeading}>How we use your information</h2>
      <p>
        Your email is used to manage your account, verify your identity at login, and
        determine whether you have an active subscription. We do not sell or share your
        personal information with third parties for marketing purposes.
      </p>

      <h2 style={sectionHeading}>Third-party services</h2>
      <p>This site uses the following third-party services, each with its own privacy practices:</p>
      <ul>
        <li><strong>Amazon Web Services (Cognito, DynamoDB, Lambda, S3)</strong> -- account authentication and data storage</li>
        <li><strong>Stripe</strong> -- subscription payment processing</li>
        <li><strong>NewsAPI.org</strong> -- news headlines shown on the homepage</li>
        <li><strong>Google AdSense</strong> -- displays advertisements. Google may use cookies to serve ads based on your visits to this and other websites. You can opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: "#58a6ff" }}>Google Ads Settings</a>.</li>
      </ul>

      <h2 style={sectionHeading}>Cookies</h2>
      <p>
        We use cookies to keep you signed in between visits. Third-party services listed
        above (particularly Google AdSense) may also set their own cookies to serve
        relevant advertising.
      </p>

      <h2 style={sectionHeading}>Data retention</h2>
      <p>
        Account information is retained as long as your account remains active. You may
        request deletion of your account and associated data at any time by contacting us.
      </p>

      <h2 style={sectionHeading}>Contact</h2>
      <p style={{ color: "#8b949e", fontSize: 14 }}>
        Questions about this policy can be directed to the site owner via the contact
        information on the About page.
      </p>
    </main>
  );
}

const sectionHeading = { fontSize: 20, marginTop: 28, marginBottom: 8 };