import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  diagram: string;
  serviceDescriptions?: Record<string, string>;
  className?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  diagram,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

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

  return (
    <div className={`mermaid-container relative ${className}`} ref={containerRef}>
      <div
        dangerouslySetInnerHTML={{ __html: svg }}
        className="flex justify-center items-center"
      />
    </div>
  );
};

export default MermaidDiagram;
