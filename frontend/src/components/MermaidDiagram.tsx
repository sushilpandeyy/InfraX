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
        // Dark glassmorphism theme matching frontend
        primaryColor: '#3b82f6',      // blue-primary
        primaryTextColor: '#e0e7ff',  // light text
        primaryBorderColor: '#60a5fa', // blue-light
        lineColor: '#60a5fa',          // blue-light for connections
        secondaryColor: '#1e3a8a',     // darker blue
        tertiaryColor: '#0f172a',      // dark-card
        background: '#0a0e1a',         // dark-bg
        mainBkg: 'rgba(15, 23, 42, 0.7)', // glass card color
        secondBkg: 'rgba(59, 130, 246, 0.2)', // subtle blue
        nodeBorder: '#60a5fa',
        clusterBkg: 'rgba(15, 23, 42, 0.5)',
        clusterBorder: '#3b82f6',
        edgeLabelBackground: 'rgba(15, 23, 42, 0.9)',
        labelTextColor: '#e0e7ff',
        textColor: '#e0e7ff',
        fontSize: '14px',
        fontFamily: '"Inter", "Space Grotesk", sans-serif',
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
              const currentFill = rect_element.getAttribute('fill') || 'rgba(59, 130, 246, 0.2)';
              rect_element.setAttribute('style', `filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8)); fill: ${currentFill}; transition: all 0.2s ease;`);
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
          className="absolute z-50 px-5 py-4 rounded-xl shadow-2xl text-sm max-w-md pointer-events-none border animate-fade-in"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(24px)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.2)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3"
            style={{
              background: 'rgba(15, 23, 42, 0.98)',
              borderRight: '1px solid rgba(59, 130, 246, 0.5)',
              borderBottom: '1px solid rgba(59, 130, 246, 0.5)',
            }}
          />
          <div className="text-blue-primary font-bold mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            Service Purpose
          </div>
          <div className="text-gray-100 leading-relaxed font-medium">{tooltip.text}</div>
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram;
