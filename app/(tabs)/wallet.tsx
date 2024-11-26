import { View, ScrollView, Text, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getUserTransactions } from "@/api/newen";
import NewenIcon from "@/assets/icons/newen.svg";
import { useUser } from "@/context/UserContext";
import { usePrivy } from "@privy-io/expo";
import { Link } from "expo-router";

export default function PouchScreen() {
  const { ankyUser } = useUser();
  const { getAccessToken, user } = usePrivy();
  const { setCreateAccountModalVisible } = useUser();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const token = await getAccessToken();
      const userId = ankyUser?.id;
      const walletAddress = ankyUser?.wallet_address;
      if (!userId || !walletAddress || !token)
        throw new Error("Missing required auth data");
      return getUserTransactions(userId, walletAddress, token);
    },
  });

  const totalNewen =
    transactions?.transactions?.reduce((acc, tx) => acc + tx.amount, 0) || 0;
  console.log("the user is: ", user);
  return (
    <View className="flex-1 bg-purple-400 p-4">
      <View className="mt-12 mb-6">
        <Text className="text-white text-3xl font-bold mb-2">💰</Text>
        <Text className="text-purple-200 text-lg">
          Balance: {totalNewen} newen
        </Text>
      </View>

      {user && !ankyUser?.farcaster_account?.fid ? (
        <View className="flex-1 bg-purple-800/30 rounded-2xl p-6">
          <Text className="text-white text-lg text-center">
            Write your first 8 minute session to start earning $newen
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {!transactions?.transactions ||
          transactions.transactions.length === 0 ? (
            <View className="flex-1 bg-purple-800/30 rounded-2xl p-6 items-center">
              <NewenIcon width={90} height={90} className="mb-4 opacity-50" />
              <Text className="text-purple-200 text-lg text-center">
                Your newen transaction history will appear here.{"\n"}
                Write daily to earn more!
              </Text>
            </View>
          ) : (
            transactions.transactions.map((transaction) => (
              <View
                key={transaction.hash}
                className="bg-purple-800/30 p-4 rounded-xl mb-3 flex-row items-center border border-purple-700/50"
              >
                <View className="mr-4">
                  <NewenIcon width={40} height={40} />
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-xl font-bold ${
                      transaction.amount > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount} newen
                  </Text>
                  <Text className="text-purple-300 text-sm">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {!user && (
        <View className="mt-6">
          <Pressable
            onPress={() => setCreateAccountModalVisible(true)}
            className="bg-purple-600 px-8 py-4 rounded-xl border border-purple-400 active:bg-purple-700"
          >
            <Text className="text-white text-xl font-bold text-center">
              Login to Start Earning
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
