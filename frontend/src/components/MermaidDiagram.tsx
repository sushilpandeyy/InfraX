import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  diagram: string;
  serviceDescriptions?: Record<string, string>;
  className?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  diagram,
  serviceDescriptions = {},
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (diagram) {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg: renderedSvg } = await mermaid.render(id, diagram);
          setSvg(renderedSvg);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          setSvg('<p class="text-red-500">Failed to render diagram</p>');
        }
      }
    };

    renderDiagram();
  }, [diagram]);

  useEffect(() => {
    if (svg && containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) return;

      // Add hover listeners to all nodes
      const nodes = svgElement.querySelectorAll('.node');

      nodes.forEach((node) => {
        const textElement = node.querySelector('text, .nodeLabel');
        if (!textElement) return;

        const nodeText = textElement.textContent?.trim() || '';
        const description = serviceDescriptions[nodeText];

        if (description) {
          node.addEventListener('mouseenter', (e) => {
            const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();

            if (containerRect) {
              setTooltip({
                text: description,
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top - 10,
              });
            }
          });

          node.addEventListener('mouseleave', () => {
            setTooltip(null);
          });

          // Add cursor pointer style
          (node as SVGElement).style.cursor = 'pointer';
        }
      });
    }
  }, [svg, serviceDescriptions]);

  return (
    <div className={`mermaid-container relative ${className}`} ref={containerRef}>
      <div
        dangerouslySetInnerHTML={{ __html: svg }}
        className="flex justify-center items-center"
      />
      {tooltip && (
        <div
          className="absolute z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-xs pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram;
