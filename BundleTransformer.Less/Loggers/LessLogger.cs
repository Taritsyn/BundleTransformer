namespace BundleTransformer.Less.Loggers
{
	using dotless.Core.Loggers;

	internal sealed class LessLogger : ILogger
	{
		public LogLevel Level { get; set; }


		public LessLogger(LogLevel level)
		{
			Level = level;
		}


		public void Log(LogLevel level, string message)
		{
			if (Level <= level)
			{
				throw new LessCompilingException(message.Trim());
			}
		}

		public void Info(string message)
		{
			// do nothing
		}

		public void Info(string message, params object[] args)
		{
			// do nothing
		}

		public void Debug(string message)
		{
			// do nothing
		}

		public void Debug(string message, params object[] args)
		{
			// do nothing
		}

		public void Error(string message)
		{
			Log(LogLevel.Error, message);
		}

		public void Error(string message, params object[] args)
		{
			Log(LogLevel.Error, string.Format(message, args));
		}

		public void Warn(string message)
		{
			Log(LogLevel.Warn, message);
		}

		public void Warn(string message, params object[] args)
		{
			Log(LogLevel.Warn, string.Format(message, args));
		}
	}
}