import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useChatHistory } from '../../hooks/useApi';
import { formatTime } from '../../utils/dateUtils';
import { MapPin, Plane, Hotel, Calendar, CreditCard, Star } from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { Send, Bot, User, TrendingUp, DollarSign, Target, Lightbulb } from 'lucide-react-native';
import MarkdownText from '../../components/MarkdownText';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  tripSuggestions?: TripSuggestion[];
  paymentRequest?: PaymentRequest;
}

interface TripSuggestion {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  rating: number;
  image: string;
  highlights: string[];
  category: string;
}

interface PaymentRequest {
  id: string;
  description: string;
  amount: number;
  currency: string;
  breakdown: {
    item: string;
    cost: number;
  }[];
}

export default function ChatScreen() {
  const { data: chatData, loading: chatLoading } = useChatHistory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (chatData?.messages) {
      setMessages(chatData.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }
  }, [chatData]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await apiService.sendChatMessage(text);
      
      if (response.success && response.data?.message) {
        const aiMessage: Message = {
          ...response.data.message,
          timestamp: new Date(response.data.message.timestamp)
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fallback error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble responding right now. Please try again.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleTripSelect = (trip: TripSuggestion) => {
    sendMessage(`I'm interested in "${trip.title}" to ${trip.destination}. Can you help me book this?`);
  };

  const handlePayment = async (paymentRequest: PaymentRequest) => {
    try {
      // In a real app, integrate with payment processor
      const response = await apiService.processPayment({
        paymentId: paymentRequest.id,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency
      });
      
      if (response.success) {
        sendMessage("Payment completed successfully! Your booking is confirmed.");
      }
    } catch (error) {
      console.error('Payment failed:', error);
      sendMessage("Payment failed. Please try again.");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (chatLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -30 : -20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.botAvatar}>
              <Bot size={20} color="#0EA5E9" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Financial Assistant</Text>
              <Text style={styles.headerSubtitle}>AI-powered insights</Text>
            </View>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineStatus} />
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View key={message.id} style={styles.messageWrapper}>
              <View style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}>
                {!message.isUser && (
                  <View style={styles.messageAvatar}>
                    <Bot size={16} color="#0EA5E9" />
                  </View>
                )}
                
                <View style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble
                ]}>
                  {message.isUser ? (
                    <Text style={[
                      styles.messageText,
                      styles.userText
                    ]}>
                      {message.text}
                    </Text>
                  ) : (
                    <MarkdownText style={[
                      styles.messageText,
                      styles.aiText
                    ]}>
                      {message.text}
                    </MarkdownText>
                  )}
                  <Text style={[
                    styles.messageTime,
                    message.isUser ? styles.userTime : styles.aiTime
                  ]}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>

                {message.isUser && (
                  <View style={styles.messageAvatar}>
                    <User size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>

              {/* Suggestions */}
              {message.suggestions && (
                <View style={styles.suggestionsContainer}>
                  {message.suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Trip Suggestions */}
              {message.tripSuggestions && (
                <View style={styles.tripSuggestionsContainer}>
                  <Text style={styles.tripSuggestionsTitle}>Trip Suggestions</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.tripSuggestionsScroll}
                  >
                    {message.tripSuggestions.map((trip) => (
                      <TouchableOpacity
                        key={trip.id}
                        style={styles.tripCard}
                        onPress={() => handleTripSelect(trip)}
                      >
                        <Image source={{ uri: trip.image }} style={styles.tripImage} />
                        <View style={styles.tripCardContent}>
                          <Text style={styles.tripTitle}>{trip.title}</Text>
                          <View style={styles.tripMeta}>
                            <MapPin size={12} color="#6B7280" />
                            <Text style={styles.tripDestination}>{trip.destination}</Text>
                          </View>
                          <View style={styles.tripDetails}>
                            <View style={styles.tripRating}>
                              <Star size={12} color="#F59E0B" fill="#F59E0B" />
                              <Text style={styles.ratingText}>{trip.rating}</Text>
                            </View>
                            <Text style={styles.tripDuration}>{trip.duration}</Text>
                          </View>
                          <Text style={styles.tripPrice}>${trip.price}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Payment Request */}
              {message.paymentRequest && (
                <View style={styles.paymentContainer}>
                  <Text style={styles.paymentTitle}>Payment Required</Text>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentDescription}>{message.paymentRequest.description}</Text>
                    <Text style={styles.paymentAmount}>${message.paymentRequest.amount}</Text>
                  </View>
                  <View style={styles.paymentBreakdown}>
                    {message.paymentRequest.breakdown.map((item, index) => (
                      <View key={index} style={styles.breakdownItem}>
                        <Text style={styles.breakdownLabel}>{item.item}</Text>
                        <Text style={styles.breakdownCost}>${item.cost}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => handlePayment(message.paymentRequest)}
                  >
                    <CreditCard size={16} color="#FFFFFF" />
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.messageContainer}>
              <View style={styles.messageAvatar}>
                <Bot size={16} color="#0EA5E9" />
              </View>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                  <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                  <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContent}
          >
            <TouchableOpacity 
              style={styles.quickActionChip}
              onPress={() => sendMessage("Analyze my spending patterns")}
            >
              <TrendingUp size={14} color="#0EA5E9" />
              <Text style={styles.quickActionText}>Analyze Spending</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionChip}
              onPress={() => sendMessage("How can I save more money?")}
            >
              <Target size={14} color="#0EA5E9" />
              <Text style={styles.quickActionText}>Save More</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionChip}
              onPress={() => sendMessage("Split a restaurant bill")}
            >
              <DollarSign size={14} color="#0EA5E9" />
              <Text style={styles.quickActionText}>Split Bill</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionChip}
              onPress={() => sendMessage("Plan a trip to Japan")}
            >
              <MapPin size={14} color="#0EA5E9" />
              <Text style={styles.quickActionText}>Plan Trip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionChip}
              onPress={() => sendMessage("Book a hotel in Paris")}
            >
              <Hotel size={14} color="#0EA5E9" />
              <Text style={styles.quickActionText}>Book Hotel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionChip}
              onPress={() => sendMessage("Find flights to New York")}
            >
              <Plane size={14} color="#0EA5E9" />
              <Text style={styles.quickActionText}>Find Flights</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about your finances..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim()}
            >
              <Send size={18} color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  statusIndicator: {
    alignItems: 'center',
  },
  onlineStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#0EA5E9',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTime: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 44,
    marginTop: 8,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 12,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  tripSuggestionsContainer: {
    marginLeft: 44,
    marginTop: 16,
  },
  tripSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  tripSuggestionsScroll: {
    marginHorizontal: -8,
  },
  tripCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tripCardContent: {
    padding: 12,
  },
  tripTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  tripDuration: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  tripPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
    fontFamily: 'Inter-Bold',
  },
  paymentContainer: {
    marginLeft: 44,
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  paymentDetails: {
    marginBottom: 12,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  paymentBreakdown: {
    marginBottom: 16,
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  breakdownCost: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 60 : 50,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    paddingVertical: 8,
    lineHeight: 20,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
});