interface BreadcrumbProps {
  items: string[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => (
  <nav className="text-sm text-gray-600 mb-4">
    {items.map((item, i) => (
      <span key={i}>
        {i > 0 && <span className="mx-1">›</span>}
        {i === items.length - 1 ? <span className="font-semibold">{item}</span> : item}
      </span>
    ))}
  </nav>
);
