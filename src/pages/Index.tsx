  const handleSubmit = useCallback(async (text: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setDecision(null);
    setIsDecisionActive(false);
    setPhase(1);

    try {
      setTimeout(() => setPhase(2), 2000);
      setTimeout(() => setPhase(3), 4000);

      const response = await fetch("https://synapse-api-b8oc.onrender.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Sunucu patladı.");

      const data = await response.json();
      setDecision(data.final_karar);
      setIsDecisionActive(true);
    } catch (error) {
      console.error("Hata:", error);
      setDecision("⚠️ Bağlantı koptu. Motor cevap vermiyor.");
      setIsDecisionActive(true);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);
