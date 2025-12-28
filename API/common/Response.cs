using System;

namespace API.common;

public class Response<T>
{
    public bool IsSuccess { get; set; }
    public string? Error { get; set; }
    public string? Message { get; set; }
    public T Data { get; set; }

    public Response(T data, bool isSuccess = true, string? message = null, string? error = null)
    {
        Data = data;
        IsSuccess = isSuccess;
        Message = message;
        Error = error;
    }

    public static Response<T> Success(T data, string? message = "")
    {
        return new Response<T>(data, true, message);
    }

    public static Response<T> Fail(string error, T data = default!)
    {
        return new Response<T>(data, false, null, error);
    }

}
