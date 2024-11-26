import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import Cast from "./Cast";
import { Cast as CastType } from "@/types/Cast";

interface FeedProps {
  casts: CastType[];
  cursor?: string;
  onLoadMore: (cursor: string) => Promise<void>;
  isLoading?: boolean;
}

const Feed: React.FC<FeedProps> = ({
  casts,
  cursor,
  onLoadMore,
  isLoading = false,
}) => {
  console.log("Feed component rendering with props:", {
    casts,
    cursor,
    isLoading,
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreCasts, setHasMoreCasts] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log("useEffect: Updating hasMoreCasts", {
      castsLength: casts?.length,
    });
    setHasMoreCasts(casts?.length === 25);
  }, [casts]);

  const handleScroll = useCallback(
    ({ nativeEvent }: { nativeEvent: any }) => {
      console.log("handleScroll called", {
        isLoadingMore,
        hasMoreCasts,
        cursor,
      });

      if (isLoadingMore || !hasMoreCasts || !cursor) {
        console.log("Scroll handler early return", {
          isLoadingMore,
          hasMoreCasts,
          cursor,
        });
        return;
      }

      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      const scrollPosition = contentOffset.y;
      const totalHeight = contentSize.height;
      const scrollViewHeight = layoutMeasurement.height;

      const scrollPercentage =
        (scrollPosition + scrollViewHeight) / totalHeight;

      console.log("Scroll metrics:", { scrollPercentage });

      if (scrollPercentage > 0.55) {
        console.log("Triggering loadMoreCasts");
        loadMoreCasts();
      }
    },
    [cursor, isLoadingMore, hasMoreCasts, loadMoreCasts]
  );

  const loadMoreCasts = useCallback(async () => {
    console.log("loadMoreCasts called", { cursor });
    if (!cursor) return;

    try {
      setIsLoadingMore(true);
      console.log("Calling onLoadMore with cursor:", cursor);
      await onLoadMore(cursor);
    } catch (error) {
      console.error("Error loading more casts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, onLoadMore]);

  const renderCast = useCallback(({ item }: { item: CastType }) => {
    console.log("Rendering cast:", item.hash);
    return <Cast cast={item} />;
  }, []);

  const renderFooter = useCallback(() => {
    console.log("Rendering footer", { isLoadingMore, hasMoreCasts });

    if (isLoadingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    if (!hasMoreCasts) {
      return (
        <View className="py-8 items-center">
          <Text className="text-gray-500 text-lg">
            You've reached the end of the feed
          </Text>
        </View>
      );
    }

    return null;
  }, [isLoadingMore, hasMoreCasts]);

  if (!casts?.length) {
    console.log("No casts available, returning null");
    return null;
  }

  if (isLoading) {
    console.log("Feed is loading");
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log("Rendering FlatList with casts:", casts.length);

  return (
    <FlatList
      ref={flatListRef}
      data={casts}
      renderItem={renderCast}
      keyExtractor={(item) => item.hash}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      removeClippedSubviews={true}
      className="flex-1"
      contentContainerStyle={{ alignItems: "center" }}
    />
  );
};

export default Feed;
