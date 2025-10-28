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
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        // Vintage black/white/red theme
        primaryColor: '#0f0f23',          // vintage black
        primaryTextColor: '#00FFFF',      // vintage white
        primaryBorderColor: '#00FFFF',    // vintage white borders
        lineColor: '#00FFFF',             // white connections
        secondaryColor: '#333333',        // dark gray
        tertiaryColor: '#0f0f23',         // vintage black
        background: '#0f0f23',            // vintage black bg
        mainBkg: '#0f0f23',               // vintage black card
        secondBkg: '#1a1a1a',             // slightly lighter black
        nodeBorder: '#00FFFF',            // white borders
        clusterBkg: '#0f0f23',            // black cluster background
        clusterBorder: '#00FFFF',         // white cluster border
        edgeLabelBackground: '#0f0f23',   // black label background
        labelTextColor: '#00FFFF',        // white text
        textColor: '#00FFFF',             // white text
        fontSize: '14px',
        fontFamily: 'Georgia, "Courier New", monospace',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
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
          setSvg('<p class="text-retro-pink">Failed to render diagram</p>');
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

      // Helper function to find matching description with flexible matching
      const findDescription = (nodeText: string): string | null => {
        // Direct match
        if (serviceDescriptions[nodeText]) {
          return serviceDescriptions[nodeText];
        }

        // Case-insensitive match
        const lowerNodeText = nodeText.toLowerCase();
        for (const [key, value] of Object.entries(serviceDescriptions)) {
          if (key.toLowerCase() === lowerNodeText) {
            return value;
          }
        }

        // Partial match - check if key is contained in node text or vice versa
        for (const [key, value] of Object.entries(serviceDescriptions)) {
          const lowerKey = key.toLowerCase();
          if (lowerNodeText.includes(lowerKey) || lowerKey.includes(lowerNodeText)) {
            return value;
          }
        }

        // Extract service name from labels like "Amazon EC2" -> "EC2"
        const serviceMatch = nodeText.match(/(?:Amazon|AWS|Azure|GCP|Google)\s+(.+)/i);
        if (serviceMatch) {
          const serviceName = serviceMatch[1];
          for (const [key, value] of Object.entries(serviceDescriptions)) {
            if (key.toLowerCase().includes(serviceName.toLowerCase()) ||
                serviceName.toLowerCase().includes(key.toLowerCase())) {
              return value;
            }
          }
        }

        return null;
      };

      nodes.forEach((node) => {
        const textElement = node.querySelector('text, .nodeLabel');
        if (!textElement) return;

        const nodeText = textElement.textContent?.trim() || '';
        const description = findDescription(nodeText);

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

            // Add glow effect on hover
            const nodeElement = e.currentTarget as SVGElement;
            const rect_element = nodeElement.querySelector('rect, circle, polygon, path');
            if (rect_element) {
              rect_element.setAttribute('data-original-style', rect_element.getAttribute('style') || '');
              const currentFill = rect_element.getAttribute('fill') || '#0f0f23';
              rect_element.setAttribute('style', `filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.8)); fill: ${currentFill}; stroke: #FF00FF; stroke-width: 2px; transition: all 0.2s ease;`);
            }
          });

          node.addEventListener('mouseleave', () => {
            setTooltip(null);

            // Remove glow effect
            const rect_element = node.querySelector('rect, circle, polygon, path');
            if (rect_element) {
              const originalStyle = rect_element.getAttribute('data-original-style') || '';
              rect_element.setAttribute('style', originalStyle);
            }
          });

          // Add cursor pointer style and subtle initial hint
          const nodeElement = node as SVGElement;
          nodeElement.style.cursor = 'pointer';

          // Add subtle opacity change to indicate interactivity
          const rect_element = nodeElement.querySelector('rect, circle, polygon, path');
          if (rect_element) {
            rect_element.setAttribute('style', (rect_element.getAttribute('style') || '') + ' transition: all 0.2s ease;');
          }
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
          className="absolute z-50 px-5 py-4 shadow-2xl text-sm max-w-md pointer-events-none border-pixel bg-retro-dark animate-fade-in font-mono"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            background: '#0f0f23',
            border: '2px solid #00FFFF',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3"
            style={{
              background: '#0f0f23',
              border: '2px solid #00FFFF',
              borderTop: 'none',
              borderLeft: 'none',
            }}
          />
          <div className="text-retro-cyan font-bold mb-2 text-xs uppercase tracking-wider flex items-center gap-2 font-heading">
            <span className="text-base">ℹ️</span>
            SERVICE PURPOSE
          </div>
          <div className="text-retro-cyan leading-relaxed">{tooltip.text}</div>
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram;
