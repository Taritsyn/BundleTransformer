namespace BundleTransformer.Core.Assets
{
	using System;
	using System.Collections;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;

	using Resources;

	/// <summary>
	/// Collection of file extension mappings
	/// </summary>
	public sealed class FileExtensionMappingCollection : IEnumerable<FileExtensionMapping>
	{
		/// <summary>
		/// Internal collection of file extension mappings
		/// </summary>
		private readonly Dictionary<string, string> _entries = new Dictionary<string, string>();

		/// <summary>
		/// Gets or sets a asset type code associated with the specified file extension
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Asset type code</returns>
		public string this[string fileExtension]
		{
			get
			{
				if (string.IsNullOrWhiteSpace(fileExtension))
				{
					throw new ArgumentException(
						string.Format(Strings.Common_ArgumentIsEmpty, "fileExtension"), "fileExtension");
				}

				string processedFileExtension = ProcessFileExtension(fileExtension);

				return _entries[processedFileExtension];
			}
			set
			{
				if (string.IsNullOrWhiteSpace(fileExtension))
				{
					throw new ArgumentException(
						string.Format(Strings.Common_ArgumentIsEmpty, "fileExtension"), "fileExtension");
				}

				if (string.IsNullOrWhiteSpace(value))
				{
					throw new ArgumentException(
						string.Format(Strings.Common_ArgumentIsEmpty, "value"), "value");
				}

				string processedFileExtension = ProcessFileExtension(fileExtension);
				string processedAssetTypeCode = ProcessAssetTypeCode(value);

				if (_entries.ContainsKey(processedFileExtension))
				{
					throw new ArgumentException(
						string.Format(Strings.FileExtensionMapping_DuplicateFileExtension, processedFileExtension),
						"fileExtension");
				}

				_entries[processedFileExtension] = processedAssetTypeCode;
			}
		}

		/// <summary>
		/// Gets a collection containing the file extensions
		/// </summary>
		public ICollection<string> FileExtensions
		{
			get { return _entries.Keys; }
		}

		/// <summary>
		/// Gets a collection containing the asset type codes
		/// </summary>
		public ICollection<string> AssetTypeCodes
		{
			get { return _entries.Values; }
		}

		/// <summary>
		/// Gets a number of mappings contained in the collection
		/// </summary>
		public int Count
		{
			get { return _entries.Count; }
		}


		public IEnumerator<FileExtensionMapping> GetEnumerator()
		{
			foreach (KeyValuePair<string, string> entry in _entries)
			{
				yield return new FileExtensionMapping(entry.Key, entry.Value);
			}
		}

		IEnumerator IEnumerable.GetEnumerator()
		{
			return GetEnumerator();
		}

		/// <summary>
		/// Determines whether a collections contains the specified file extension
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of check (true - contains; false - not contains)</returns>
		public bool ContainsFileExtension(string fileExtension)
		{
			if (string.IsNullOrWhiteSpace(fileExtension))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "fileExtension"), "fileExtension");
			}

			return InnerContainsFileExtension(fileExtension);
		}

		/// <summary>
		/// Determines whether a collections contains the specified asset type code
		/// </summary>
		/// <param name="assetTypeCode">Asset type code</param>
		/// <returns>Result of check (true - contains; false - not contains)</returns>
		public bool ContainsAssetTypeCode(string assetTypeCode)
		{
			if (string.IsNullOrWhiteSpace(assetTypeCode))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "assetTypeCode"), "assetTypeCode");
			}

			return _entries.ContainsValue(assetTypeCode);
		}

		/// <summary>
		/// Determines whether a collections contains the specified file extension mapping
		/// </summary>
		/// <param name="mapping">File extension mapping</param>
		/// <returns>Result of check (true - contains; false - not contains)</returns>
		public bool Contains(FileExtensionMapping mapping)
		{
			if (mapping == null)
			{
				throw new ArgumentNullException(
					"mapping", string.Format(Strings.Common_ArgumentIsNull, "mapping"));
			}

			if (string.IsNullOrWhiteSpace(mapping.FileExtension))
			{
				throw new EmptyValueException(Strings.Common_ValueIsEmpty);
			}

			return InnerContainsFileExtension(mapping.FileExtension);
		}

		private bool InnerContainsFileExtension(string fileExtension)
		{
			string processedFileExtension = ProcessFileExtension(fileExtension);

			return _entries.ContainsKey(processedFileExtension);
		}

		/// <summary>
		/// Gets a asset type code by file path
		/// </summary>
		/// <param name="filePath">File path</param>
		/// <returns>Asset type code</returns>
		public string GetAssetTypeCodeByFilePath(string filePath)
		{
			if (string.IsNullOrWhiteSpace(filePath))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "filePath"), "filePath");
			}

			string processedAssetPath = filePath.TrimEnd().ToLowerInvariant();
			int dotCount = processedAssetPath.Count(c => c == '.');

			if (dotCount == 0)
			{
				return Constants.AssetTypeCode.Unknown;
			}

			string assetTypeCode = Constants.AssetTypeCode.Unknown;
			string assetFileExtension;

			if (dotCount == 1)
			{
				assetFileExtension = Path.GetExtension(processedAssetPath);
				if (_entries.ContainsKey(assetFileExtension))
				{
					assetTypeCode = _entries[assetFileExtension];
				}
			}
			else
			{
				assetFileExtension = string.Empty;
				ICollection<string> fileExtensions = _entries.Keys;

				foreach (string fileExtension in fileExtensions)
				{
					if (processedAssetPath.EndsWith(fileExtension))
					{
						assetFileExtension = fileExtension;
						break;
					}
				}

				if (assetFileExtension.Length > 0 && _entries.ContainsKey(assetFileExtension))
				{
					assetTypeCode = this[assetFileExtension];
				}
			}

			return assetTypeCode;
		}

		/// <summary>
		/// Adds a specified file extension and asset type code to the collection
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <param name="assetTypeCode">Asset type code</param>
		public void Add(string fileExtension, string assetTypeCode)
		{
			if (string.IsNullOrWhiteSpace(fileExtension))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "fileExtension"), "fileExtension");
			}

			if (string.IsNullOrWhiteSpace(assetTypeCode))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "assetTypeCode"), "assetTypeCode");
			}

			InnerAdd(fileExtension, assetTypeCode);
		}

		/// <summary>
		/// Adds a specified file extension mapping to the collection
		/// </summary>
		/// <param name="mapping">File extension mapping</param>
		public void Add(FileExtensionMapping mapping)
		{
			if (mapping == null)
			{
				throw new ArgumentNullException(
					"mapping", string.Format(Strings.Common_ArgumentIsNull, "mapping"));
			}

			if (string.IsNullOrWhiteSpace(mapping.FileExtension))
			{
				throw new EmptyValueException(Strings.Common_ValueIsEmpty);
			}

			if (string.IsNullOrWhiteSpace(mapping.AssetTypeCode))
			{
				throw new EmptyValueException(Strings.Common_ValueIsEmpty);
			}

			InnerAdd(mapping.FileExtension, mapping.AssetTypeCode);
		}

		private void InnerAdd(string fileExtension, string assetTypeCode)
		{
			string processedFileExtension = ProcessFileExtension(fileExtension);
			string processedAssetTypeCode = ProcessAssetTypeCode(assetTypeCode);

			if (_entries.ContainsKey(processedFileExtension))
			{
				throw new ArgumentException(
					string.Format(Strings.FileExtensionMapping_DuplicateFileExtension, processedFileExtension),
					"fileExtension");
			}

			_entries.Add(processedFileExtension, processedAssetTypeCode);
		}

		/// <summary>
		/// Removes a mapping with the specified file extension from the collection
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Result of operation (true - mapping is successfully found and removed;
		/// false - otherwise)</returns>
		public bool Remove(string fileExtension)
		{
			if (string.IsNullOrWhiteSpace(fileExtension))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "fileExtension"), "fileExtension");
			}

			return InnerRemove(fileExtension);
		}

		/// <summary>
		/// Removes a mapping from the collection
		/// </summary>
		/// <param name="mapping">File extension mapping</param>
		/// <returns>Result of operation (true - mapping is successfully found and removed;
		/// false - otherwise)</returns>
		public bool Remove(FileExtensionMapping mapping)
		{
			if (mapping == null)
			{
				throw new ArgumentNullException(
					"mapping", string.Format(Strings.Common_ArgumentIsNull, "mapping"));
			}

			if (string.IsNullOrWhiteSpace(mapping.FileExtension))
			{
				throw new EmptyValueException(Strings.Common_ValueIsEmpty);
			}

			return InnerRemove(mapping.FileExtension);
		}

		private bool InnerRemove(string fileExtension)
		{
			string processedFileExtension = ProcessFileExtension(fileExtension);

			return _entries.Remove(processedFileExtension);
		}

		/// <summary>
		/// Removes all file extension mappings from the collection
		/// </summary>
		public void Clear()
		{
			_entries.Clear();
		}

		/// <summary>
		/// Process a file extension
		/// </summary>
		/// <param name="fileExtension">File extension</param>
		/// <returns>Processed file extension</returns>
		private static string ProcessFileExtension(string fileExtension)
		{
			string processedFileExtension = fileExtension.Trim().ToLowerInvariant();

			return processedFileExtension;
		}

		/// <summary>
		/// Process a asset type code
		/// </summary>
		/// <param name="assetTypeCode">Asset type code</param>
		/// <returns>Processed asset type code</returns>
		private static string ProcessAssetTypeCode(string assetTypeCode)
		{
			string processedAssetTypeCode = assetTypeCode.Trim();

			return processedAssetTypeCode;
		}
	}
}