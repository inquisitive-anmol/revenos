import { useEffect } from 'react';

interface PageMetadataProps {
  title: string;
  description?: string;
}

/**
 * Component to handle dynamic page titles and metadata for SEO.
 * Updates document.title and meta description on mount.
 */
const PageMetadata = ({ title, description }: PageMetadataProps) => {
  useEffect(() => {
    // Set the document title
    const fullTitle = title.includes('RevenOs') ? title : `${title} | RevenOs`;
    document.title = fullTitle;

    // Update the meta description if provided
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
      
      // Also update OG and Twitter descriptions
      ['og:description', 'twitter:description'].forEach(prop => {
        const el = document.querySelector(`meta[property="${prop}"]`);
        if (el) el.setAttribute('content', description);
      });
    }

    // Optional: Update OG and Twitter titles as well
    ['og:title', 'twitter:title'].forEach(prop => {
      const el = document.querySelector(`meta[property="${prop}"]`);
      if (el) el.setAttribute('content', fullTitle);
    });
  }, [title, description]);

  return null; // This component doesn't render anything
};

export default PageMetadata;
