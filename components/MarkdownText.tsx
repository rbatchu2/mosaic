import React from 'react';
import { Text, TextStyle } from 'react-native';

interface MarkdownTextProps {
  children: string;
  style?: TextStyle | TextStyle[];
}

export default function MarkdownText({ children, style }: MarkdownTextProps) {
  // Parse markdown-style bold text **text** and convert to React Native Text components
  const parseMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** markers and render as bold
        const boldText = part.slice(2, -2);
        return (
          <Text key={index} style={[style, { fontWeight: '700', fontFamily: 'Inter-Bold' }]}>
            {boldText}
          </Text>
        );
      } else {
        // Regular text
        return part;
      }
    });
  };

  return (
    <Text style={style}>
      {parseMarkdown(children)}
    </Text>
  );
} 