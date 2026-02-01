export function injectSampleTerms() {
  const article = document.createElement("article");
  article.style.cssText = `
    max-width: 800px;
    margin: 40px auto;
    padding: 40px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: white;
    line-height: 1.6;
  `;

  article.innerHTML = `
    <h1 style="margin-bottom: 1em;">Terms of Service - Test Page</h1>
    
    <p style="color: #666; font-size: 14px; margin-bottom: 2em;">
      This is a test page for PlainTerms. Use Ctrl+Space to activate voice commands.
    </p>

    <h2>1. ACCEPTANCE OF TERMS</h2>
    <p>
      By accessing and using this service, you agree to be bound by these Terms of Service. 
      We may modify these terms at any time without prior notice. Your continued use constitutes 
      acceptance of changes.
    </p>

    <h2>2. DATA COLLECTION AND PRIVACY</h2>
    <p>
      We may collect, use, and share your personal data with third parties for marketing purposes. 
      Your data may be transferred to servers located in any jurisdiction at our discretion. 
      We may sell or transfer your information to third-party advertisers and data brokers.
    </p>

    <h2>3. ARBITRATION AND DISPUTE RESOLUTION</h2>
    <p>
      By using our services, you agree to binding arbitration for any disputes. You waive your 
      right to participate in class action lawsuits and your right to a jury trial. All disputes 
      must be resolved through individual arbitration in our chosen jurisdiction.
    </p>

    <h2>4. LIABILITY AND WARRANTIES</h2>
    <p>
      This service is provided "as is" and "as available" without warranties of any kind, express 
      or implied. We are not liable for any damages, losses, or harm resulting from use of our 
      services. We exclude all liability to the fullest extent permitted by law.
    </p>

    <h2>5. TERMINATION</h2>
    <p>
      We reserve the right to suspend or terminate your account at any time, for any reason, 
      without notice or explanation. We may also terminate these terms at our sole discretion.
    </p>

    <h2>6. INDEMNIFICATION</h2>
    <p>
      You agree to indemnify and hold harmless our company, officers, directors, and employees 
      from any claims, damages, or expenses arising from your use of the service.
    </p>

    <h2>7. MODIFICATIONS</h2>
    <p>
      We can modify, suspend, or discontinue any aspect of the service at our sole discretion 
      without liability to you.
    </p>

    <h2>8. GOVERNING LAW</h2>
    <p>
      These terms shall be governed by the laws of our chosen jurisdiction, regardless of 
      your location.
    </p>
  `;

  document.body.innerHTML = "";
  document.body.appendChild(article);
}
